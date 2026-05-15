import { Injectable } from "@nestjs/common";
import { PlansEntity } from "./dto/respone-plans.dto";

@Injectable()
export class PlansMapper {
  toResponse(entity: PlansEntity) {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      cpu: entity.cpu ?? undefined,
      ram: entity.ram ?? undefined,
      disk_space: entity.disk_space,
      domain: entity.domain,
      email: entity.email ?? undefined,
      ssl: entity.ssl,
      database: entity.database,
      website: entity.website,
      ftp_account: entity.ftp_account ?? undefined,
      cronjob: entity.cronjob ?? undefined,
      backup: entity.backup ?? undefined,
      cdn: entity.cdn ?? undefined,
      staging: entity.staging ?? undefined,
      ssh_access: entity.ssh_access ?? undefined,
      docker_support: entity.docker_support ?? undefined,
      bandwidth: entity.bandwidth,
      type: entity.type,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      subscriptions: entity.subscriptions,
    };
  }

  toResponseList(entities: PlansEntity[]) {
    return entities.map((entity) => this.toResponse(entity));
  }
}
