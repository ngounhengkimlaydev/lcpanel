import fs from 'fs';
import path from 'path';

type PrismaBlock = {
    kind: 'enum' | 'model';
    name: string;
    lines: string[];
};

type PrismaEnum = {
    name: string;
    values: string[];
};

type PrismaField = {
    name: string;
    type: string;
    kind: 'enum' | 'object' | 'scalar';
    isId: boolean;
    isList: boolean;
    isOptional: boolean;
    hasDefault: boolean;
    isUpdatedAt: boolean;
};

type PrismaModel = {
    dbName?: string;
    fields: PrismaField[];
    name: string;
};

type GenerationContext = {
    dtoFields: PrismaField[];
    enums: Map<string, PrismaEnum>;
    hasIdField: boolean;
    hasImageField: boolean;
    hasStatusField: boolean;
    moduleName: string;
    pascal: string;
    prismaDelegate: string;
    responseFields: PrismaField[];
};

const SCALAR_TYPES = new Set([
    'BigInt',
    'Boolean',
    'Bytes',
    'DateTime',
    'Decimal',
    'Float',
    'Int',
    'Json',
    'String',
]);

const AUTO_MANAGED_FIELDS = new Set(['created_at', 'updated_at']);

const { moduleName, tableReference } = parseCliArgs(process.argv.slice(2));
const schemaPath = path.resolve(__dirname, '..', 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
const { enums, models } = parsePrismaSchema(schema);
const resolvedModel = resolveModel(models, tableReference ?? moduleName);

if (!resolvedModel) {
    console.error(
        `Unable to find Prisma model/table "${tableReference ?? moduleName}" in ${schemaPath}.`,
    );
    process.exit(1);
}

const baseDir = path.join('src', 'modules', moduleName);
const pascal = toPascalCase(moduleName);
const prismaDelegate = toPrismaDelegateName(resolvedModel.name);

const dtoFields = resolvedModel.fields.filter(shouldIncludeDtoField);
const responseFields = resolvedModel.fields;
const hasIdField = dtoFields.some((field) => field.name === 'id');
const hasStatusField = dtoFields.some((field) => field.name === 'status');
const hasImageField = dtoFields.some(
    (field) => field.name === 'image' && field.kind === 'scalar' && field.type === 'String',
);

const context: GenerationContext = {
    dtoFields,
    enums,
    hasIdField,
    hasImageField,
    hasStatusField,
    moduleName,
    pascal,
    prismaDelegate,
    responseFields,
};

const templates = buildTemplates(context);

Object.entries(templates).forEach(([file, content]) => {
    const filePath = path.join(baseDir, file);
    const dir = path.dirname(filePath);

    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
    }
});

console.log(
    `NestJS module "${moduleName}" scaffolded at ${baseDir} using Prisma model "${resolvedModel.name}".`,
);

function parseCliArgs(args: string[]) {
    let moduleArg: string | undefined;
    let tableArg: string | undefined;

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === '--tbl') {
            tableArg = args[index + 1];
            index += 1;
            continue;
        }

        if (arg.startsWith('--tbl=')) {
            tableArg = arg.slice('--tbl='.length);
            continue;
        }

        if (!moduleArg) {
            moduleArg = arg;
        }
    }

    if (!moduleArg) {
        console.error(
            'Usage: ts-node scripts/module.script.ts <module-name> [--tbl=<prisma-model-or-table>]',
        );
        process.exit(1);
    }

    return {
        moduleName: moduleArg,
        tableReference: tableArg,
    };
}

function parsePrismaSchema(schema: string) {
    const lines = schema.split(/\r?\n/);
    const blocks: PrismaBlock[] = [];

    for (let index = 0; index < lines.length; index += 1) {
        const line = stripLineComment(lines[index]).trim();
        const blockMatch = line.match(/^(model|enum)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/);

        if (!blockMatch) {
            continue;
        }

        const block: PrismaBlock = {
            kind: blockMatch[1] as PrismaBlock['kind'],
            name: blockMatch[2],
            lines: [],
        };

        for (index += 1; index < lines.length; index += 1) {
            const blockLine = stripLineComment(lines[index]).trim();

            if (blockLine === '}') {
                break;
            }

            block.lines.push(blockLine);
        }

        blocks.push(block);
    }

    const enums = blocks
        .filter((block) => block.kind === 'enum')
        .map(parseEnumBlock)
        .reduce((map, entry) => map.set(entry.name, entry), new Map<string, PrismaEnum>());

    const models = blocks
        .filter((block) => block.kind === 'model')
        .map((block) => parseModelBlock(block, enums));

    return { enums, models };
}

function parseEnumBlock(block: PrismaBlock): PrismaEnum {
    const values = block.lines
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('@@'))
        .map((line) => line.split(/\s+/)[0]);

    return {
        name: block.name,
        values,
    };
}

function parseModelBlock(block: PrismaBlock, enums: Map<string, PrismaEnum>): PrismaModel {
    const fields: PrismaField[] = [];
    let dbName: string | undefined;

    block.lines.forEach((line) => {
        if (!line) {
            return;
        }

        if (line.startsWith('@@map(')) {
            dbName = extractMapValue(line);
            return;
        }

        if (line.startsWith('@@')) {
            return;
        }

        const fieldMatch = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([^\s]+)(.*)$/);

        if (!fieldMatch) {
            return;
        }

        const [, name, rawType, attributes] = fieldMatch;
        const isList = rawType.endsWith('[]');
        const isOptional = rawType.endsWith('?');
        const type = rawType.replace(/\[\]$/, '').replace(/\?$/, '');
        const kind = inferFieldKind(type, enums);

        fields.push({
            hasDefault: /@default\(/.test(attributes),
            isId: /@id\b/.test(attributes),
            isList,
            isOptional,
            isUpdatedAt: /@updatedAt\b/.test(attributes),
            kind,
            name,
            type,
        });
    });

    return {
        dbName,
        fields,
        name: block.name,
    };
}

function inferFieldKind(type: string, enums: Map<string, PrismaEnum>): PrismaField['kind'] {
    if (enums.has(type)) {
        return 'enum';
    }

    if (SCALAR_TYPES.has(type) || type.startsWith('Unsupported(')) {
        return 'scalar';
    }

    return 'object';
}

function stripLineComment(line: string) {
    const commentIndex = line.indexOf('//');

    if (commentIndex === -1) {
        return line;
    }

    return line.slice(0, commentIndex);
}

function extractMapValue(line: string) {
    const match = line.match(/@@map\("([^"]+)"\)/);
    return match?.[1];
}

function resolveModel(models: PrismaModel[], reference: string) {
    const exactMatch = models.find(
        (model) => model.name === reference || model.dbName === reference,
    );

    if (exactMatch) {
        return exactMatch;
    }

    const normalizedReference = normalizeIdentifier(reference);
    const normalizedMatches = models.filter((model) =>
        [model.name, model.dbName ?? ''].some(
            (candidate) => normalizeIdentifier(candidate) === normalizedReference,
        ),
    );

    if (normalizedMatches.length === 1) {
        return normalizedMatches[0];
    }

    return null;
}

function normalizeIdentifier(value: string) {
    return value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function toPascalCase(value: string) {
    return value
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('');
}

function toPrismaDelegateName(modelName: string) {
    return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function shouldIncludeDtoField(field: PrismaField) {
    return (
        (field.kind === 'scalar' || field.kind === 'enum') &&
        !AUTO_MANAGED_FIELDS.has(field.name) &&
        !field.isUpdatedAt
    );
}

function isStatusField(field: PrismaField) {
    return (
        field.name === 'status' &&
        (field.kind === 'enum' ||
            (field.kind === 'scalar' && ['BigInt', 'Int'].includes(field.type)))
    );
}

function isFieldRequired(field: PrismaField, forceRequired = false) {
    if (forceRequired) {
        return true;
    }

    if (field.isId) {
        return false;
    }

    if (field.isOptional || field.hasDefault || field.isUpdatedAt) {
        return false;
    }

    return true;
}

function buildTemplates(context: GenerationContext) {
    const templates: Record<string, string> = {
        [`dto/${context.moduleName}.dto.ts`]: buildDtoFile(context),
        [`dto/create-${context.moduleName}.dto.ts`]: buildCreateDtoFile(context),
        [`dto/update-${context.moduleName}.dto.ts`]: buildUpdateDtoFile(context),
        [`dto/respone-${context.moduleName}.dto.ts`]: buildResponseDtoFile(context),
        [`${context.moduleName}.controller.ts`]: buildControllerFile(context),
        [`${context.moduleName}.mapper.ts`]: buildMapperFile(context),
        [`${context.moduleName}.repository.ts`]: buildRepositoryFile(context),
        [`${context.moduleName}.service.ts`]: buildServiceFile(context),
        [`${context.moduleName}.module.ts`]: buildModuleFile(context),
    };

    if (context.hasIdField) {
        templates[`dto/delete-${context.moduleName}.dto.ts`] = buildSingleFieldDtoFile(
            `Delete${context.pascal}Dto`,
            context.dtoFields.find((field) => field.name === 'id')!,
            context.enums,
        );
    }

    if (context.hasStatusField) {
        templates[`dto/update-status-${context.moduleName}.dto.ts`] = buildSingleFieldDtoFile(
            `UpdateStatus${context.pascal}Dto`,
            context.dtoFields.find((field) => field.name === 'status')!,
            context.enums,
        );
    }

    return templates;
}

function buildDtoFile(context: GenerationContext) {
    const validatorImports = new Set<string>();
    const enumNames = new Set<string>();
    let needsStatusImport = false;
    let needsTransformerType = false;

    const properties = context.dtoFields.map((field) => {
        const property = buildDtoProperty(field, context.enums, false);
        property.validatorImports.forEach((item) => validatorImports.add(item));
        property.enumNames.forEach((item) => enumNames.add(item));
        needsStatusImport = needsStatusImport || property.needsStatusImport;
        needsTransformerType = needsTransformerType || property.needsTransformerType;
        return property.lines;
    });

    const sections = [
        buildDtoImports({
            needsStatusImport,
            needsTransformerType,
            validatorImports,
        }),
        buildDtoEnumSupport(enumNames, context.enums),
        `export class ${context.pascal}Dto {\n${properties.join('\n\n')}\n}`,
    ];

    return joinSections(sections);
}

function buildCreateDtoFile(context: GenerationContext) {
    if (!context.hasIdField) {
        return joinSections([
            `import { ${context.pascal}Dto } from './${context.moduleName}.dto';`,
            `export class Create${context.pascal}Dto extends ${context.pascal}Dto {}`,
        ]);
    }

    return joinSections([
        `import { OmitType } from '@nestjs/mapped-types';`,
        `import { ${context.pascal}Dto } from './${context.moduleName}.dto';`,
        `export class Create${context.pascal}Dto extends OmitType(${context.pascal}Dto, ['id'] as const) {}`,
    ]);
}

function buildUpdateDtoFile(context: GenerationContext) {
    return joinSections([
        `import { ${context.pascal}Dto } from './${context.moduleName}.dto';`,
        `export class Update${context.pascal}Dto extends ${context.pascal}Dto {}`,
    ]);
}

function buildSingleFieldDtoFile(
    className: string,
    field: PrismaField,
    enums: Map<string, PrismaEnum>,
) {
    const property = buildDtoProperty(field, enums, true);

    return joinSections([
        buildDtoImports({
            needsStatusImport: property.needsStatusImport,
            needsTransformerType: property.needsTransformerType,
            validatorImports: property.validatorImports,
        }),
        buildDtoEnumSupport(property.enumNames, enums),
        `export class ${className} {\n${property.lines}\n}`,
    ]);
}

function buildResponseDtoFile(context: GenerationContext) {
    const enumNames = new Set<string>();
    const lines = context.responseFields.map((field) => {
        if (field.kind === 'enum' && !isStatusField(field)) {
            enumNames.add(field.type);
        }

        return `    ${field.name}${isResponseFieldOptional(field) ? '?' : ''}: ${getResponseType(
            field,
        )};`;
    });

    const sections = [
        buildResponseImports(context.responseFields),
        buildResponseEnumSupport(enumNames, context.enums),
        `export type ${context.pascal}Entity = {\n${lines.join('\n')}\n};`,
    ];

    return joinSections(sections);
}

function buildControllerFile(context: GenerationContext) {
    const statusImport = context.hasStatusField
        ? `import { UpdateStatus${context.pascal}Dto } from './dto/update-status-${context.moduleName}.dto';`
        : '';

    const updateStatusRoute = context.hasStatusField
        ? `
    @Put(':id/status')
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.UPDATE)
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatus${context.pascal}Dto) {
        return this.${toPrismaDelegateName(context.pascal)}Service.updateStatus(id, dto);
    }
`
        : '';

    return joinSections([
        `import {
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
import { ${context.pascal}Service } from './${context.moduleName}.service';
import { Create${context.pascal}Dto } from './dto/create-${context.moduleName}.dto';
import { Update${context.pascal}Dto } from './dto/update-${context.moduleName}.dto';
${statusImport}
import { PermissionAction } from '../permission/dto/permission-action.enum';
import { Permission } from '../permission/permission.decorator';
import { PermissionGuard } from '../permission/permission.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('${context.moduleName}')
export class ${context.pascal}Controller {
    static MODULE_KEY = '${toPrismaDelegateName(context.pascal)}';

    constructor(private readonly ${toPrismaDelegateName(context.pascal)}Service: ${context.pascal}Service) {}

    @Get()
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.VIEW)
    async get(
        @Query('page') page: string,
        @Query('table_size') tableSize: string,
        @Query('filter') filter: string,
        @Query('sort_by') sortBy: string,
        @Query('sort_type') sortType: string,
    ) {
        return this.${toPrismaDelegateName(context.pascal)}Service.findAll({
            page: Number(page) || 1,
            tableSize: Number(tableSize) || 10,
            filter: filter ? JSON.parse(filter) : {},
            sortBy: sortBy || 'id',
            sortType: (sortType as 'asc' | 'desc') || 'desc',
        });
    }

    @Get(':id')
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.VIEW)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.${toPrismaDelegateName(context.pascal)}Service.findOne(id);
    }

    @Post()
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.CREATE)
    create(@Body() dto: Create${context.pascal}Dto) {
        return this.${toPrismaDelegateName(context.pascal)}Service.create(dto);
    }

    @Put(':id')
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.UPDATE)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: Update${context.pascal}Dto) {
        return this.${toPrismaDelegateName(context.pascal)}Service.update(id, dto);
    }${updateStatusRoute}
    @Delete(':id')
    @Permission(${context.pascal}Controller.MODULE_KEY, PermissionAction.DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.${toPrismaDelegateName(context.pascal)}Service.remove(id);
    }
}`,
    ]);
}

function buildMapperFile(context: GenerationContext) {
    const responseLines = context.responseFields.map(
        (field) => `            ${field.name}: entity.${field.name},`,
    );

    return joinSections([
        `import { Injectable } from '@nestjs/common';
import { ${context.pascal}Entity } from './dto/respone-${context.moduleName}.dto';

@Injectable()
export class ${context.pascal}Mapper {
    toResponse(entity: ${context.pascal}Entity) {
        return {
${responseLines.join('\n')}
        };
    }

    toResponseList(entities: ${context.pascal}Entity[]) {
        return entities.map((entity) => this.toResponse(entity));
    }
}`,
    ]);
}

function buildRepositoryFile(context: GenerationContext) {
    const statusImport = context.hasStatusField
        ? `import { UpdateStatus${context.pascal}Dto } from './dto/update-status-${context.moduleName}.dto';`
        : '';

    const updateStatusMethod = context.hasStatusField
        ? `
    updateStatus(id: number, dto: UpdateStatus${context.pascal}Dto) {
        return this.prisma.${context.prismaDelegate}.update({
            where: { id },
            data: {
                status: dto.status,
            },
        });
    }
`
        : '';

    return joinSections([
        `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Create${context.pascal}Dto } from './dto/create-${context.moduleName}.dto';
import { Update${context.pascal}Dto } from './dto/update-${context.moduleName}.dto';
${statusImport}

@Injectable()
export class ${context.pascal}Repository {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.${context.prismaDelegate}.findMany();
    }

    findOne(id: number) {
        return this.prisma.${context.prismaDelegate}.findUnique({ where: { id } });
    }

    create(dto: Create${context.pascal}Dto) {
        return this.prisma.${context.prismaDelegate}.create({ data: dto });
    }

    update(id: number, dto: Update${context.pascal}Dto) {
        return this.prisma.${context.prismaDelegate}.update({ where: { id }, data: dto });
    }${updateStatusMethod}
    remove(id: number) {
        return this.prisma.${context.prismaDelegate}.delete({ where: { id } });
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
                // Add searchable fields here
                // {
                //     name: {
                //         contains: keyword,
                //     },
                // },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.${context.prismaDelegate}.findMany({
                where,
                skip,
                take: tableSize,
                orderBy: {
                    [sortBy]: sortType,
                },
            }),
            this.prisma.${context.prismaDelegate}.count({ where }),
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
}`,
    ]);
}

function buildServiceFile(context: GenerationContext) {
    const cloudflareImport = context.hasImageField
        ? `import { CloudflareService } from '../../common/service/cloudflare.service';`
        : '';
    const statusImport = context.hasStatusField
        ? `import { UpdateStatus${context.pascal}Dto } from './dto/update-status-${context.moduleName}.dto';`
        : '';
    const statusMethod = context.hasStatusField
        ? `
    async updateStatus(id: number, dto: UpdateStatus${context.pascal}Dto) {
        try {
            await this.findOne(id);
            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.updateStatus(id, dto);
            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.UPDATE_STATUS,
                description: \`Updated status of ${context.pascal} \${data.id}\`,
                subjectId: data.id,
                properties: dto,
            });
            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }
`
        : '';

    const serviceConstructorArgs = [
        `private readonly ${toPrismaDelegateName(context.pascal)}Repository: ${context.pascal}Repository,`,
        `private readonly ${toPrismaDelegateName(context.pascal)}Mapper: ${context.pascal}Mapper,`,
        `private readonly wf: FileService,`,
        `private readonly userLogService: UserLogService,`,
    ];

    if (context.hasImageField) {
        serviceConstructorArgs.push(`private readonly r2: CloudflareService,`);
    }

    return joinSections([
        `import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
${cloudflareImport}
import { FileService } from '../../common/utils/file/file.service';
import { ${context.pascal}Mapper } from './${context.moduleName}.mapper';
import { ${context.pascal}Repository } from './${context.moduleName}.repository';
import { Create${context.pascal}Dto } from './dto/create-${context.moduleName}.dto';
import { Update${context.pascal}Dto } from './dto/update-${context.moduleName}.dto';
${statusImport}
import { Activity } from '../user-log/dto/activity.dto';
import { UserLogService } from '../user-log/user-log.service';

@Injectable()
export class ${context.pascal}Service {
    constructor(
        ${serviceConstructorArgs.join('\n        ')}
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

            const result = await this.${toPrismaDelegateName(context.pascal)}Repository.paginate({
                page,
                tableSize,
                filter,
                sortBy,
                sortType,
            });

            return {
                data: this.${toPrismaDelegateName(context.pascal)}Mapper.toResponseList(result.data),
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
            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.findOne(id);

            if (!data) throw new NotFoundException('${context.pascal} not found');

            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }

${buildCreateMethod(context)}

${buildUpdateMethod(context)}
${statusMethod}
${buildRemoveMethod(context)}
}`,
    ]);
}

function buildCreateMethod(context: GenerationContext) {
    if (!context.hasImageField) {
        return `    async create(dto: Create${context.pascal}Dto) {
        try {
            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.create(dto);
            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.CREATE,
                description: \`Created ${context.pascal} \${data.id}\`,
                subjectId: data.id,
                properties: dto,
            });
            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
    }

    return `    async create(dto: Create${context.pascal}Dto) {
        try {
            const imageBase64 = dto.image;
            dto.image = '';
            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.create(dto);

            if (imageBase64) {
                const upload = await this.r2.uploadBase64(imageBase64, '${toPrismaDelegateName(
                    context.pascal,
                )}', data.id);

                await this.${toPrismaDelegateName(context.pascal)}Repository.update(data.id, {
                    ...data,
                    image: upload.key,
                } as Update${context.pascal}Dto);

                data.image = upload.key;
            }

            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.CREATE,
                description: \`Created ${context.pascal} \${data.id}\`,
                subjectId: data.id,
                properties: dto,
            });

            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
}

function buildUpdateMethod(context: GenerationContext) {
    if (!context.hasImageField) {
        return `    async update(id: number, dto: Update${context.pascal}Dto) {
        try {
            const existing = await this.findOne(id);
            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.update(id, dto);
            const changes = await this.userLogService.getChanges(existing, dto);

            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.UPDATE,
                description: \`Updated ${context.pascal} \${data.id}\`,
                subjectId: data.id,
                properties: changes,
            });

            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
    }

    return `    async update(id: number, dto: Update${context.pascal}Dto) {
        try {
            const existing = await this.findOne(id);

            if (dto.image && dto.image.startsWith('data:image')) {
                const oldKey = existing.image ? this.r2.extractKeyFromUrl(existing.image) : undefined;
                const upload = await this.r2.updateBase64Image(
                    dto.image,
                    '${toPrismaDelegateName(context.pascal)}',
                    id,
                    oldKey,
                );

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

            const data = await this.${toPrismaDelegateName(context.pascal)}Repository.update(id, dto);
            const changes = await this.userLogService.getChanges(existing, dto);

            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.UPDATE,
                description: \`Updated ${context.pascal} \${data.id}\`,
                subjectId: data.id,
                properties: changes,
            });

            return this.${toPrismaDelegateName(context.pascal)}Mapper.toResponse(data);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
}

function buildRemoveMethod(context: GenerationContext) {
    if (!context.hasImageField) {
        return `    async remove(id: number) {
        try {
            const existing = await this.findOne(id);
            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.DELETE,
                description: \`Deleted ${context.pascal} \${existing.id}\`,
                subjectId: existing.id,
            });
            return await this.${toPrismaDelegateName(context.pascal)}Repository.remove(id);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
    }

    return `    async remove(id: number) {
        try {
            const existing = await this.findOne(id);

            if (existing.image) {
                const key = this.r2.extractKeyFromUrl(existing.image);
                await this.r2.deleteFile(key);
            }

            await this.userLogService.log({
                module: '${context.pascal}',
                action: Activity.DELETE,
                description: \`Deleted ${context.pascal} \${existing.id}\`,
                subjectId: existing.id,
            });

            return await this.${toPrismaDelegateName(context.pascal)}Repository.remove(id);
        } catch (e: any) {
            this.wf.logFile(e.message);
            throw new InternalServerErrorException(e.message);
        }
    }`;
}

function buildModuleFile(context: GenerationContext) {
    return joinSections([
        `import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PermissionModule } from '../permission/permission.module';
import { UserLogModule } from '../user-log/user-log.module';
import { ${context.pascal}Controller } from './${context.moduleName}.controller';
import { ${context.pascal}Mapper } from './${context.moduleName}.mapper';
import { ${context.pascal}Repository } from './${context.moduleName}.repository';
import { ${context.pascal}Service } from './${context.moduleName}.service';

@Module({
    imports: [PrismaModule, UserLogModule, PermissionModule],
    controllers: [${context.pascal}Controller],
    providers: [${context.pascal}Service, ${context.pascal}Repository, ${context.pascal}Mapper],
    exports: [${context.pascal}Service],
})
export class ${context.pascal}Module {}`,
    ]);
}

function buildDtoProperty(
    field: PrismaField,
    enums: Map<string, PrismaEnum>,
    forceRequired: boolean,
) {
    const validatorImports = new Set<string>();
    const enumNames = new Set<string>();
    const required = isFieldRequired(field, forceRequired);
    const decorators: string[] = [];
    let needsStatusImport = false;
    let needsTransformerType = false;

    if (!required) {
        validatorImports.add('IsOptional');
        decorators.push(`@IsOptional()`);
    }

    if (field.isList) {
        validatorImports.add('IsArray');
        decorators.push(`@IsArray()`);

        if (required) {
            validatorImports.add('ArrayNotEmpty');
            decorators.push(`@ArrayNotEmpty()`);
        }

        const arrayDecorator = buildArrayDecorator(field, validatorImports, enumNames);

        if (arrayDecorator.needsStatusImport) {
            needsStatusImport = true;
        }

        if (arrayDecorator.needsTransformerType) {
            needsTransformerType = true;
        }

        decorators.push(...arrayDecorator.lines);
    } else {
        const scalarDecorator = buildScalarDecorator(
            field,
            required,
            validatorImports,
            enumNames,
            enums,
        );

        if (scalarDecorator.needsStatusImport) {
            needsStatusImport = true;
        }

        if (scalarDecorator.needsTransformerType) {
            needsTransformerType = true;
        }

        decorators.push(...scalarDecorator.lines);
    }

    return {
        enumNames,
        lines:
            decorators.map((line) => `    ${line}`).join('\n') +
            `\n    ${field.name}${required ? '!' : '?'}: ${getDtoType(field)};`,
        needsStatusImport,
        needsTransformerType,
        validatorImports,
    };
}

function buildArrayDecorator(
    field: PrismaField,
    validatorImports: Set<string>,
    enumNames: Set<string>,
) {
    const lines: string[] = [];
    let needsStatusImport = false;
    let needsTransformerType = false;

    if (isStatusField(field)) {
        validatorImports.add('IsEnum');
        lines.push(`@IsEnum(Status, { each: true })`);
        needsStatusImport = true;
        return { lines, needsStatusImport, needsTransformerType };
    }

    if (field.kind === 'enum') {
        validatorImports.add('IsIn');
        enumNames.add(field.type);
        lines.push(`@IsIn(${getEnumValuesName(field.type)}, { each: true })`);
        return { lines, needsStatusImport, needsTransformerType };
    }

    switch (field.type) {
        case 'BigInt':
        case 'Int':
            validatorImports.add('IsInt');
            needsTransformerType = true;
            lines.push(`@Type(() => Number)`);
            lines.push(`@IsInt({ each: true })`);
            break;
        case 'Decimal':
        case 'Float':
            validatorImports.add('IsNumber');
            needsTransformerType = true;
            lines.push(`@Type(() => Number)`);
            lines.push(`@IsNumber({}, { each: true })`);
            break;
        case 'Boolean':
            validatorImports.add('IsBoolean');
            lines.push(`@IsBoolean({ each: true })`);
            break;
        case 'DateTime':
            validatorImports.add('IsDate');
            needsTransformerType = true;
            lines.push(`@Type(() => Date)`);
            lines.push(`@IsDate({ each: true })`);
            break;
        case 'Json':
            validatorImports.add('IsObject');
            lines.push(`@IsObject({ each: true })`);
            break;
        default:
            validatorImports.add('IsString');
            lines.push(`@IsString({ each: true })`);
            break;
    }

    return { lines, needsStatusImport, needsTransformerType };
}

function buildScalarDecorator(
    field: PrismaField,
    required: boolean,
    validatorImports: Set<string>,
    enumNames: Set<string>,
    enums: Map<string, PrismaEnum>,
) {
    const lines: string[] = [];
    let needsStatusImport = false;
    let needsTransformerType = false;

    if (isStatusField(field)) {
        validatorImports.add('IsEnum');
        needsTransformerType = true;
        needsStatusImport = true;
        lines.push(`@Type(() => Number)`);
        lines.push(`@IsEnum(Status)`);

        if (required) {
            validatorImports.add('IsNotEmpty');
            lines.push(`@IsNotEmpty()`);
        }

        return { lines, needsStatusImport, needsTransformerType };
    }

    if (field.kind === 'enum') {
        if (!enums.has(field.type)) {
            validatorImports.add('IsString');
            lines.push(`@IsString()`);
        } else {
            validatorImports.add('IsIn');
            enumNames.add(field.type);
            lines.push(`@IsIn(${getEnumValuesName(field.type)})`);
        }

        if (required) {
            validatorImports.add('IsNotEmpty');
            lines.push(`@IsNotEmpty()`);
        }

        return { lines, needsStatusImport, needsTransformerType };
    }

    switch (field.type) {
        case 'BigInt':
        case 'Int':
            validatorImports.add('IsInt');
            needsTransformerType = true;
            lines.push(`@Type(() => Number)`);
            lines.push(`@IsInt()`);
            break;
        case 'Decimal':
        case 'Float':
            validatorImports.add('IsNumber');
            needsTransformerType = true;
            lines.push(`@Type(() => Number)`);
            lines.push(`@IsNumber()`);
            break;
        case 'Boolean':
            validatorImports.add('IsBoolean');
            lines.push(`@IsBoolean()`);
            break;
        case 'DateTime':
            validatorImports.add('IsDate');
            needsTransformerType = true;
            lines.push(`@Type(() => Date)`);
            lines.push(`@IsDate()`);
            break;
        case 'Json':
            validatorImports.add('IsObject');
            lines.push(`@IsObject()`);
            break;
        default:
            validatorImports.add('IsString');
            lines.push(`@IsString()`);
            break;
    }

    if (required && field.type !== 'Boolean') {
        validatorImports.add('IsNotEmpty');
        lines.push(`@IsNotEmpty()`);
    }

    return { lines, needsStatusImport, needsTransformerType };
}

function buildDtoImports(input: {
    needsStatusImport: boolean;
    needsTransformerType: boolean;
    validatorImports: Set<string>;
}) {
    const sections: string[] = [];

    if (input.needsTransformerType) {
        sections.push(`import { Type } from 'class-transformer';`);
    }

    if (input.validatorImports.size > 0) {
        sections.push(
            `import { ${Array.from(input.validatorImports).sort().join(', ')} } from 'class-validator';`,
        );
    }

    if (input.needsStatusImport) {
        sections.push(`import { Status } from '../../../enum/status.enum';`);
    }

    return sections.join('\n');
}

function buildResponseImports(fields: PrismaField[]) {
    return fields.some((field) => isStatusField(field))
        ? `import { Status } from '../../../enum/status.enum';`
        : '';
}

function buildDtoEnumSupport(enumNames: Iterable<string>, enums: Map<string, PrismaEnum>) {
    const sections = Array.from(enumNames)
        .sort()
        .map((enumName) => {
            const values = enums.get(enumName)?.values ?? [];
            const literalValues = values.map((value) => `'${value}'`).join(', ');

            return `export const ${getEnumValuesName(enumName)} = [${literalValues}] as const;
export type ${getEnumTypeName(enumName)} = (typeof ${getEnumValuesName(enumName)})[number];`;
        });

    return sections.join('\n\n');
}

function buildResponseEnumSupport(enumNames: Iterable<string>, enums: Map<string, PrismaEnum>) {
    const sections = Array.from(enumNames)
        .sort()
        .map((enumName) => {
            const values = enums.get(enumName)?.values ?? [];
            return `export type ${getEnumTypeName(enumName)} = ${values
                .map((value) => `'${value}'`)
                .join(' | ')};`;
        });

    return sections.join('\n\n');
}

function getEnumValuesName(enumName: string) {
    return `${enumName}Values`;
}

function getEnumTypeName(enumName: string) {
    return `${enumName}Value`;
}

function getDtoType(field: PrismaField) {
    if (isStatusField(field)) {
        return field.isList ? 'Status[]' : 'Status';
    }

    if (field.kind === 'enum') {
        const enumType = getEnumTypeName(field.type);
        return field.isList ? `${enumType}[]` : enumType;
    }

    return getTsType(field.type, field.kind, field.isList);
}

function getResponseType(field: PrismaField) {
    if (isStatusField(field)) {
        return field.isList ? 'Status[]' : 'Status';
    }

    if (field.kind === 'enum') {
        const enumType = getEnumTypeName(field.type);
        return field.isList ? `${enumType}[]` : enumType;
    }

    return getTsType(field.type, field.kind, field.isList);
}

function getTsType(type: string, kind: PrismaField['kind'], isList: boolean) {
    let baseType = 'string';

    if (kind === 'object') {
        baseType = 'any';
    } else {
        switch (type) {
            case 'BigInt':
            case 'Decimal':
            case 'Float':
            case 'Int':
                baseType = 'number';
                break;
            case 'Boolean':
                baseType = 'boolean';
                break;
            case 'DateTime':
                baseType = 'Date';
                break;
            case 'Json':
                baseType = 'Record<string, any>';
                break;
            case 'Bytes':
                baseType = 'string';
                break;
            default:
                baseType = 'string';
                break;
        }
    }

    return isList ? `${baseType}[]` : baseType;
}

function isResponseFieldOptional(field: PrismaField) {
    return field.isOptional || field.kind === 'object';
}

function joinSections(sections: string[]) {
    return `${sections.filter(Boolean).join('\n\n')}\n`;
}
