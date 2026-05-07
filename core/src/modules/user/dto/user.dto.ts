// user.dto.ts
import { RoleDTO } from '../../role/dto/role.dto';
import { UserTypeDto } from '../../user-type/user-type.dto';

export interface UserDTO {
    id: number;
    full_name: string;
    username: string;
    email?: string;
    phone?: string;
    image?: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    // IDs: make roleId, companyId, branchId type-safe
    roleId: number;
    userTypeId: number;
    // companyId: number | null;
    // branchId: number | null;
    // Relations: nullable
    role?: RoleDTO;
    userType?: UserTypeDto;
}
