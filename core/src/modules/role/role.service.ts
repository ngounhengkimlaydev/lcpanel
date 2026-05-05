import type { Cache } from 'cache-manager';
import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleMapper } from './role.mapper';
import { UserLogService } from '../user-log/user-log.service';
import { Activity } from '../user-log/dto/activity.dto';
@Injectable()
export class RoleService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roleRepo: RoleRepository,
        private readonly userLogService: UserLogService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async findAll(params: {
        page?: number;
        tableSize?: number;
        filter?: { search?: string };
        sortBy?: string;
        sortType?: 'asc' | 'desc';
    }) {
        const { page = 1, tableSize = 10, filter = {}, sortBy = 'id', sortType = 'desc' } = params;

        const result = await this.roleRepo.paginate({
            page,
            tableSize,
            filter,
            sortBy,
            sortType,
        });
        const data = result.data.map((e) => {
            return {
                ...e,
                user_type: e.user_type.type,
            };
        });
        return {
            data: data,
            pagination: {
                currentPage: page,
                per_page: tableSize,
                total: result.total,
                from: result.from,
                to: result.to,
                last_page: result.last_page,
            },
        };
    }
    async findById(id: number) {
        const data = await this.roleRepo.findById(id);

        if (data) {
            const role_module = await this.roleRepo.getRoleModule(data.id);
            const module_permission = await this.roleRepo.getPermissionModuleList();

            const permissionSet = new Set(role_module.map((r: any) => r.permission_id));

            module_permission.forEach((module: any) => {
                module.checked = false;

                module.permissions.forEach((permission: any) => {
                    permission.checked = permissionSet.has(permission.id);

                    if (permission.checked) {
                        module.checked = true;
                    }
                });
            });

            return {
                role: data,
                module_permission,
                role_module,
            };
        }

        return data;
    }

    async create(dto: CreateRoleDto, userId: number) {
        try {
            const request = {
                ...dto,
                created_by: userId,
            };

            const data = await this.roleRepo.create(request);

            if (data && dto.module_permission) {
                const roleModules: {
                    role_id: number;
                    module_id: number;
                    permission_id: number;
                }[] = [];

                dto.module_permission.forEach((module: any) => {
                    (module.permissions ?? []).forEach((permission: any) => {
                        if (permission.checked) {
                            roleModules.push({
                                role_id: data.id,
                                module_id: module.id,
                                permission_id: permission.id,
                            });
                        }
                    });
                });

                if (roleModules.length) {
                    await this.prisma.roleModule.createMany({
                        data: roleModules,
                    });
                }
            }
            await this.userLogService.log({
                module: 'User Role',
                action: Activity.CREATE,
                description: `Create User Role ${data.role_name}`,
                subjectId: data.id,
                properties: dto,
            });
            return data;
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: number, dto: UpdateRoleDto) {
        try {
            const existing = await this.roleRepo.findById(id);
            if (!existing) throw new NotFoundException('Role not found');

            const data = await this.roleRepo.update(id, dto);

            if (dto.module_permission) {
                const roleModules: {
                    role_id: number;
                    module_id: number;
                    permission_id: number;
                }[] = [];

                dto.module_permission.forEach((module: any) => {
                    module.permissions.forEach((permission: any) => {
                        if (permission.checked) {
                            roleModules.push({
                                role_id: data.id,
                                module_id: module.id,
                                permission_id: permission.id,
                            });
                        }
                    });
                });

                // remove old permissions
                await this.prisma.roleModule.deleteMany({
                    where: { role_id: data.id },
                });

                // insert new permissions
                if (roleModules.length) {
                    await this.prisma.roleModule.createMany({
                        data: roleModules,
                    });
                }
            }
            await this.userLogService.log({
                module: 'User Role',
                action: Activity.UPDATE,
                description: `Updated User Role ${data.role_name}`,
                subjectId: data.id,
                properties: dto,
            });
            return RoleMapper.toDTO(data);
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }
    async delete(id: number) {
        try {
            const existing = await this.roleRepo.findById(id);
            if (!existing) throw new NotFoundException('Role not found');
            const data = await this.roleRepo.delete(id);
            await this.userLogService.log({
                module: 'User Role',
                action: Activity.DELETE,
                description: `Delete User Role ${data.role_name}`,
                subjectId: data.id,
            });
        } catch (error: any) {
            throw new InternalServerErrorException(error.message);
        }
    }
    async getPermissionModuleList() {
        try {
            const data = await this.roleRepo.getPermissionModuleList();
            return { data };
        } catch {
            throw new InternalServerErrorException();
        }
    }
    async getRoleModuleLists(roleId: number) {
        const key = `role_module_${roleId}`;

        const cached = await this.cacheManager.get(key);
        if (cached) return cached;

        const data = await this.prisma.roleModule.findMany({
            where: {
                role_id: roleId,
            },
            select: {
                role_id: true,
                module_id: true,
                permission_id: true,
                module: {
                    select: {
                        module_key: true,
                        featured: true,
                    },
                },
                permission: true,
            },
            orderBy: {
                module_id: 'asc',
            },
        });

        const grouped = Object.values(
            data.reduce((acc: any, item) => {
                if (!acc[item.module_id]) {
                    acc[item.module_id] = {
                        role_id: item.role_id,
                        module_id: item.module_id,
                        module_key: item.module.module_key,
                        featured: item.module.featured,
                        permission_id: item.permission_id,
                        permissions: [],
                    };
                }

                acc[item.module_id].permissions.push({
                    id: item.permission.id,
                    role_id: item.role_id,
                    module_id: item.module_id,
                    permission_id: item.permission.id,
                    permission_name: item.permission.permission_name,
                });

                return acc;
            }, {}),
        );

        await this.cacheManager.set(key, grouped, 300);

        return grouped;
    }
}
