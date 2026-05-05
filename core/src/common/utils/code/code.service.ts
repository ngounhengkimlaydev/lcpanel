import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrefixCodeService {
    constructor(private readonly prisma: PrismaService) {}
    async generatePrefixCode(
        prefix: string,
        table: string,
        column: string,
        prefixLength: number = 3,
    ) {
        const model = (this.prisma as any)[table];

        const last = await model.findFirst({
            orderBy: { id: 'desc' },
        });

        let nextNumber = 1;

        if (last?.[column]) {
            const num = parseInt(last.code.replace(prefix, ''));
            nextNumber = num + 1;
        }
        const code = `${prefix}${nextNumber.toString().padStart(prefixLength, '0')}`;

        return code ?? 'C001';
    }
}
