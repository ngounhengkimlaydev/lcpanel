import { Injectable } from '@nestjs/common';
import { CustomerEntity } from './dto/respone-customer.dto';

@Injectable()
export class CustomerMapper {
    toResponse(entity: CustomerEntity) {
        return {
            id: entity.id,
            // user_type_id: entity.user_type_id,
            // role_id: entity.role_id,
            // code: entity.code,
            // image: entity.image,
            name: entity.name,
            // phone: entity.phone,
            email: entity.email,
            // gender: entity.gender,
            // password: entity.password,
            // google: entity.google,
            // apple_id: entity.apple_id,
            // firebase_uid: entity.firebase_uid,
            status: entity.status,
            // deleted_at: entity.deleted_at,
            created_at: entity.created_at,
            // updated_at: entity.updated_at,
            // user_type: entity.user_type,
            // role: entity.role,
            // gitConnections: entity.gitConnections,
            // gitProjects: entity.gitProjects,
            // deploymentHistories: entity.deploymentHistories,
            // invoices: entity.invoices,
            plan: entity.subscription.plan.name,
            websites: entity.subscription.plan.website,
            storage: entity.subscription.plan.disk_space,
        };
    }

    toResponseList(entities: CustomerEntity[]) {
        return entities.map((entity) => this.toResponse(entity));
    }
}
