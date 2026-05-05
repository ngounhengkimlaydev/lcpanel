export enum FileTypeEnum {
    IMAGE = 1,
    PDF = 2,
    WORD = 3,
}

export function getFileTypeEnum(mimeType: string): FileTypeEnum | null {
    if (mimeType.startsWith('image/')) return FileTypeEnum.IMAGE;
    if (mimeType === 'application/pdf') return FileTypeEnum.PDF;
    if (mimeType.includes('word') || mimeType.includes('document')) return FileTypeEnum.WORD;
    return null;
}
