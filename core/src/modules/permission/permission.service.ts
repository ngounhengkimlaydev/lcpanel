import { Injectable } from "@nestjs/common";
import { PermissionRepository } from "./permission.repository";

@Injectable()
export class PermissionService {
    constructor(
        private repo: PermissionRepository
    ) {}

    async hasPermission(
        roleId: number,
        moduleKey: string,
        action: string,
    ): Promise<boolean> {
        return this.repo.findRolePermission(roleId, moduleKey, action);
    }
}