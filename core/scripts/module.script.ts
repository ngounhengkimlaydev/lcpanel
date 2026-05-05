import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
    console.error('Usage: ts-node scripts/module.script.ts <module-name>');
    process.exit(1);
}

const baseDir = path.join('src', 'modules', moduleName);

const pascal = moduleName
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

const templates: Record<string, string> = {
    [`dto/${moduleName}.dto.ts`]: `import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Status } from '../../../enum/status.enum';

export class ${pascal}Dto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsOptional()
    image?: string;

    @IsEnum(Status)
    @Type(() => Number)
    status!: Status;
}
`,

    [`dto/create-${moduleName}.dto.ts`]: `import { OmitType } from '@nestjs/mapped-types';
import { ${pascal}Dto } from './${moduleName}.dto';

export class Create${pascal}Dto extends OmitType(${pascal}Dto, ['id'] as const) {}
`,

    [`dto/update-${moduleName}.dto.ts`]: `import { ${pascal}Dto } from './${moduleName}.dto';

export class Update${pascal}Dto extends ${pascal}Dto {}
`,

    [`dto/delete-${moduleName}.dto.ts`]: `import { PickType } from '@nestjs/mapped-types';
import { ${pascal}Dto } from './${moduleName}.dto';

export class Delete${pascal}Dto extends PickType(${pascal}Dto, ['id'] as const) {}
`,

    [`dto/update-status-${moduleName}.dto.ts`]: `import { PickType } from '@nestjs/mapped-types';
import { ${pascal}Dto } from './${moduleName}.dto';

export class UpdateStatus${pascal}Dto extends PickType(${pascal}Dto, ['status'] as const) {}
`,

    [`dto/respone-${moduleName}.dto.ts`]: `import { Status } from '../../../enum/status.enum';

export type ${pascal}Entity = {
    id: number;
    image?: string;
    status: Status;
    created_at: Date;
    updated_at: Date;
};
`,

    [`${moduleName}.controller.ts`]: `import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ${pascal}Service } from './${moduleName}.service';
import { Create${pascal}Dto } from './dto/create-${moduleName}.dto';
import { Update${pascal}Dto } from './dto/update-${moduleName}.dto';
import { UpdateStatus${pascal}Dto } from './dto/update-status-${moduleName}.dto';
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('${moduleName}')
export class ${pascal}Controller {
    static MODULE_KEY = '${camel}';

    constructor(private readonly ${camel}Service: ${pascal}Service) {}

    @Get()
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.${camel}Service.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id')
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.${camel}Service.findOne(id);
    }

    @Post()
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: Create${pascal}Dto) {
        return this.${camel}Service.create(dto);
    }

    @Put(':id')
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Update${pascal}Dto) {
        return this.${camel}Service.update(id, dto);
    }

    @Put(':id/status')
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatus${pascal}Dto) {
        return this.${camel}Service.updateStatus(id, dto);
    }

    @Delete(':id')
    @Permission(${pascal}Controller.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.${camel}Service.remove(id);
    }
}
`,

    [`${moduleName}.mapper.ts`]: `import { Injectable } from '@nestjs/common';
import { ${pascal}Entity } from './dto/respone-${moduleName}.dto';

@Injectable()
export class ${pascal}Mapper {
    toResponse(entity: ${pascal}Entity) {
        return {
            id: entity.id,
            image: entity.image,
            status: entity.status,
            createdAt: entity.created_at,
            updatedAt: entity.updated_at,
        };
    }

    toResponseList(entities: any[]) {
        return entities.map((entity) => this.toResponse(entity));
    }
}
`,

    [`${moduleName}.repository.ts`]: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${pascal}Dto } from './dto/create-${moduleName}.dto';
import { Update${pascal}Dto } from './dto/update-${moduleName}.dto';
import { UpdateStatus${pascal}Dto } from './dto/update-status-${moduleName}.dto';

@Injectable()
export class ${pascal}Repository {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.${camel}.findMany();
    }

    findOne(id: number) {
        return this.prisma.${camel}.findUnique({ where: { id } });
    }

    create(dto: Create${pascal}Dto) {
        return this.prisma.${camel}.create({ data: dto });
    }

    update(id: number, dto: Update${pascal}Dto) {
        return this.prisma.${camel}.update({ where: { id }, data: dto });
    }

    updateStatus(id: number, dto: UpdateStatus${pascal}Dto) {
        return this.prisma.${camel}.update({
            where: { id },
            data: {
                status: dto.status,
            },
        });
    }

    remove(id: number) {
        return this.prisma.${camel}.delete({ where: { id } });
    }

    async paginate(params: {
        page: number;
        tableSize: number;
        filter?: { search?: string };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        const { page, tableSize, filter = {}, sortBy = 'id', sortType = 'desc' } = params;
        const skip = (page - 1) * tableSize;

        const where: any = {};

         if (filter?.search?.trim()) {
            const keyword = filter.search.trim();

            where.OR = [
                // {
                //     module_name: {
                //         contains: keyword,
                //     },
                // },
                // {
                //     module_key: {
                //         contains: keyword,
                //     },
                // },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.${camel}.findMany({
                where,
                skip,
                take: tableSize,
                orderBy: {
                    [sortBy]: sortType,
                },
            }),
            this.prisma.${camel}.count({ where }),
        ]);

        const from = total === 0 ? 0 : skip + 1;
        const to = skip + data.length;
        const last_page = Math.ceil(total / tableSize);

        return {
            data,
            total,
            from,
            to,
            last_page,
        };
    }
}
`,

    [`${moduleName}.service.ts`]: `import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CloudflareService } from '../../common/service/cloudflare.service';
import { FileService } from '../../common/utils/file/file.service';
import { ${pascal}Mapper } from './${moduleName}.mapper';
import { ${pascal}Repository } from './${moduleName}.repository';
import { Create${pascal}Dto } from './dto/create-${moduleName}.dto';
import { Update${pascal}Dto } from './dto/update-${moduleName}.dto';
import { UpdateStatus${pascal}Dto } from './dto/update-status-${moduleName}.dto';
import { Activity } from '../user-log/dto/activity.dto';
import { UserLogService } from '../user-log/user-log.service';

@Injectable()
export class ${pascal}Service {
    constructor(
        private readonly ${camel}Repository: ${pascal}Repository,
        private readonly ${camel}Mapper: ${pascal}Mapper,
        private readonly wf: FileService,
        private readonly userLogService: UserLogService,
        private readonly r2: CloudflareService,
    ) {}

    async findAll(params: {
        page?: number;
        tableSize?: number;
        filter?: { search?: string };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        try {
            const {
                page = 1,
                tableSize = 10,
                filter = {},
                sortBy = 'id',
                sortType = 'desc',
            } = params;

            const result = await this.${camel}Repository.paginate({
                page,
                tableSize,
                filter,
                sortBy,
                sortType,
            });

            return {
                data: this.${camel}Mapper.toResponseList(result.data),
                pagination: {
                    currentPage: page,
                    per_page: tableSize,
                    total: result.total,
                    from: result.from,
                    to: result.to,
                    last_page: result.last_page,
                },
            };
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async findOne(id: number) {
        try {
            const data = await this.${camel}Repository.findOne(id);

            if (!data) throw new NotFoundException('${pascal} not found');

            return data;
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async create(dto: Create${pascal}Dto) {
        let imageKey: string | null = null;
        try {
            const logoBase64 = dto.image;
            dto.image = '';
            const data = await this.${camel}Repository.create(dto);
            if (logoBase64) {
                const upload = await this.r2.uploadBase64(logoBase64, '${camel}', data.id);

                imageKey = upload.key;

                await this.${camel}Repository.update(data.id, {
                    ...data,
                    image: imageKey,
                } as Update${pascal}Dto);

                data.image = imageKey;
            }
            await this.userLogService.log({
                module: '${pascal}',
                action: Activity.CREATE,
                description: \`Created ${pascal} \${data.id}\`,
                subjectId: data.id,
                properties: dto,
            });

        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async update(id: number, dto: Update${pascal}Dto) {
        let newKey: string | null = null;
        try {
            const existing = await this.findOne(id);
            if (dto.image && dto.image.startsWith('data:image')) {
                const oldKey = existing.image
                    ? this.r2.extractKeyFromUrl(existing.image)
                    : undefined;

                const upload = await this.r2.updateBase64Image(dto.image, '${camel}', id, oldKey);

                newKey = upload.key;
                dto.image = upload.key;
            } else if (dto.image === null) {
                if (existing.image) {
                    const oldKey = this.r2.extractKeyFromUrl(existing.image);
                    await this.r2.deleteFile(oldKey);
                }
                dto.image = '';
            } else {
                dto.image = existing.image ?? undefined;
            }

            const data = await this.${camel}Repository.update(id, dto);
            const newData = this.${camel}Mapper.toResponse(data);
            const changes = await this.userLogService.getChanges(existing, dto);
            await this.userLogService.log({
                module: '${pascal}',
                action: Activity.UPDATE,
                description: \`Updated ${pascal} \${data.id}\`,
                subjectId: data.id,
                properties: changes,
            });
            return newData;
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async updateStatus(id: number, dto: UpdateStatus${pascal}Dto) {
        try {
            await this.findOne(id);
            const data = await this.${camel}Repository.updateStatus(id, dto);
            await this.userLogService.log({
                module: '${pascal}',
                action: Activity.UPDATE_STATUS,
                description: \`Updated status of ${pascal} \${data.id} to \${dto.status == 1 ? 'Enable' : 'Disable'}\`,
                subjectId: data.id,
                properties: dto,
            });
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

    async remove(id: number) {
        try {
            const existing = await this.findOne(id);
            if (existing.image) {
                const key = this.r2.extractKeyFromUrl(existing.image);
                await this.r2.deleteFile(key);
            }
            await this.userLogService.log({
                module: '${pascal}',
                action: Activity.DELETE,
                description: \`Deleted ${pascal} \${existing.id}\`,
                subjectId: existing.id,
            });
            return await this.${camel}Repository.remove(id);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }
}
`,

    [`${moduleName}.module.ts`]: `import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { ${pascal}Controller } from './${moduleName}.controller';
import { ${pascal}Mapper } from './${moduleName}.mapper';
import { ${pascal}Repository } from './${moduleName}.repository';
import { ${pascal}Service } from './${moduleName}.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [${pascal}Controller],
    providers: [${pascal}Service, ${pascal}Repository, ${pascal}Mapper],
    exports: [${pascal}Service],
})
export class ${pascal}Module {}
`,
};

Object.entries(templates).forEach(([file, content]) => {
    const filePath = path.join(baseDir, file);
    const dir = path.dirname(filePath);

    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
    }
});

console.log(`NestJS module "${moduleName}" scaffolded at ${baseDir}`);
