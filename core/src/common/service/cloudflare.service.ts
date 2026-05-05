import { Injectable } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { FileService } from '../utils/file/file.service';

type S3Sender = {
    send(command: unknown): Promise<unknown>;
};

type R2Folder = {
    name: string;
    prefix: string;
};

type R2File = {
    name: string;
    type: 'image' | 'file';
    ext: string;
    key: string;
    url: string;
    size?: string;
};

@Injectable()
export class CloudflareService {
    private s3: S3Sender;

    constructor(private readonly wf: FileService) {
        this.s3 = new S3Client({
            region: 'auto',
            endpoint: process.env.R2_ENDPOINT,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY!,
                secretAccessKey: process.env.R2_SECRET_KEY!,
            },
        }) as unknown as S3Sender;
    }

    async uploadBase64(base64: string, module?: string, id?: number) {
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        const tenant: string = process.env.Type_Folder ?? '';
        let filename: any = module;
        let key = `${filename}`;
        if (!matches) {
            throw new Error('Invalid base64 format');
        }

        const mimeType = matches[1]; // 👈 important
        const buffer = Buffer.from(matches[2], 'base64');

        const isImage = mimeType.startsWith('image/');

        let finalBuffer: any = buffer;
        let extension = mimeType.split('/')[1]; // png, pdf, etc.

        // ✅ If image → compress
        if (isImage) {
            finalBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
            extension = 'webp';
            filename = `${module}-${Date.now()}.${extension}`;
            key = `${tenant}/${module}/${id}/${filename}`;
        }

        // ✅ filename

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
            Body: finalBuffer,
            ContentType: isImage ? 'image/webp' : mimeType, // 👈 dynamic
        });

        await this.sendS3(command);

        return {
            key,
            url: `${process.env.R2_PUBLIC_URL}/${key}`,
        };
    }

    async updateBase64Image(base64: string, module: string, id: number, oldKey?: string) {
        let newKey: string | null = null;
        try {
            // 1. Upload new image
            const upload = await this.uploadBase64(base64, module, id);

            newKey = upload.key;

            // 2. Delete old image (if exists)
            if (oldKey) {
                await this.deleteFile(oldKey);
            }

            return upload;
        } catch (error) {
            if (newKey) {
                await this.deleteFile(newKey);
            }

            throw error;
        }
    }

    async deleteFile(key: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: key,
            });

            await this.sendS3(command);

            return true;
        } catch (error) {
            console.error('R2 delete error:', error);
            return false;
        }
    }

    extractKeyFromUrl(url: string): string {
        return url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    }

    async listFiles(prefix: string = '') {
        try {
            // Step 1: detect root
            const root = await this.listLevel(prefix);

            const targetPrefix =
                root.folders.length === 1 && root.files.length === 0
                    ? root.folders[0].prefix
                    : prefix;

            // Step 2: get current level
            const level1 = await this.listLevel(targetPrefix);

            // ✅ folders
            const folders = level1.folders.map((folder) => ({
                name: folder.name,
                type: 'folder',
                prefix: folder.prefix,
            }));

            // ✅ files
            const files = level1.files.map((file) => ({
                name: file.name,
                type: 'file',
                prefix: file.key,
                size: file.size,
                url: file.url,
            }));
            const usedBytes = await this.getStorageUsage();
            // ✅ merge
            return {
                data: [...folders, ...files],
                storage: {
                    used: formatBytes(usedBytes),
                    usedBytes,
                    total: '10GB',
                },
            };
        } catch (e: any) {
            this.wf.logFile(e.message);
        }
    }

    async deleteFolder(prefix: string): Promise<boolean> {
        try {
            const normalizedPrefix = this.normalizePrefix(prefix);

            // 1. Get all objects inside folder
            const response = await this.sendListObjects(
                new ListObjectsV2Command({
                    Bucket: process.env.R2_BUCKET!,
                    Prefix: normalizedPrefix,
                }),
            );

            const objects = response.Contents ?? [];

            if (objects.length === 0) {
                return true; // nothing to delete
            }

            // 2. Delete all files in parallel
            await Promise.all(
                objects.map((obj) => {
                    if (!obj.Key) return;
                    return this.deleteFile(obj.Key);
                }),
            );

            return true;
        } catch (error) {
            console.error('Delete folder error:', error);
            return false;
        }
    }
    async getStorageUsage(prefix: string = ''): Promise<number> {
        let totalSize = 0;
        let continuationToken: string | undefined = undefined;

        do {
            const response = await this.sendListObjects(
                new ListObjectsV2Command({
                    Bucket: process.env.R2_BUCKET!,
                    Prefix: prefix,
                    ContinuationToken: continuationToken,
                }),
            );

            const objects = response.Contents ?? [];

            for (const obj of objects) {
                if (obj.Size) {
                    totalSize += obj.Size;
                }
            }

            continuationToken = response.NextContinuationToken;
        } while (continuationToken);

        return totalSize; // in bytes
    }

    private async sendS3(command: PutObjectCommand | DeleteObjectCommand): Promise<void> {
        await this.s3.send(command);
    }

    private async sendListObjects(command: ListObjectsV2Command): Promise<ListObjectsV2CommandOutput> {
        return (await this.s3.send(command)) as ListObjectsV2CommandOutput;
    }

    private async listLevel(prefix: string): Promise<{ folders: R2Folder[]; files: R2File[] }> {
        const normalizedPrefix = this.normalizePrefix(prefix);
        const response = await this.sendListObjects(
            new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET!,
                Prefix: normalizedPrefix,
                Delimiter: '/',
            }),
        );

        const folders = (response.CommonPrefixes ?? [])
            .filter((p) => p.Prefix)
            .map((p) => ({
                name: p.Prefix!.replace(prefix, '').replace(/\/$/, ''),
                prefix: p.Prefix!,
            }));

        const files = (response.Contents ?? [])
            .filter((obj) => obj.Key && obj.Key !== prefix)
            .map((obj) => {
                const key = obj.Key!;
                const name = key.replace(prefix, '');
                const ext = name.split('.').pop()?.toUpperCase() ?? '';
                return {
                    name,
                    type: ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'].includes(ext)
                        ? ('image' as const)
                        : ('file' as const),
                    ext,
                    key,
                    url: `${process.env.R2_PUBLIC_URL}/${key}`,
                    size: obj.Size ? formatBytes(obj.Size) : undefined,
                };
            });

        return { folders, files };
    }
    private normalizePrefix(prefix: string) {
        if (!prefix || prefix === '/') return ''; // ✅ root fix
        return prefix;
    }
    async uploadDocumentFile(
        base64: string,
        module?: string,
        id?: number,
        serviceId?: number,
        originalFileName?: string,
    ) {
        const matches = base64.match(/^data:(.+);base64,(.+)$/);
        if (!matches) throw new Error('Invalid base64 format');

        const tenant: string = process.env.Type_Folder ?? '';
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const isImage = mimeType.startsWith('image/');

        let finalBuffer: Buffer;
        let fileName: string | null;
        let contentType: string;

        // ✅ If image → compress
        if (isImage) {
            finalBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
            fileName = `${module}-${Date.now()}.webp`;
            contentType = 'image/webp';
        } else {
            finalBuffer = buffer;
            fileName = originalFileName ?? null;
            contentType = mimeType;
        }

        const key = `${tenant}/${module}/${serviceId}/${id}/${fileName}`;
        const filePath = `${tenant}/${module}/${serviceId}/${id}/`;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
            Body: finalBuffer,
            ContentType: isImage ? 'image/webp' : mimeType,
        });

        await this.sendS3(command);

        return {
            key,
            url: `${process.env.R2_PUBLIC_URL}/${key}`,
            fileName,
            filePath,
        };
    }
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
