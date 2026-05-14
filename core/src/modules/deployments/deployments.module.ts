import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { FileService } from "../../common/utils/file/file.service";
import { PermissionModule } from "../permission/permission.module";
import { ServerModule } from "../server/server.module";
import { UserLogModule } from "../user-log/user-log.module";
import { DeployService } from "./deployments.service";
import { DeploymentsController } from "./deployments.controller";
import { DeploymentsRepository } from "./deployments.repository";

@Module({
  imports: [PrismaModule, PermissionModule, UserLogModule, ServerModule],
  controllers: [DeploymentsController],
  providers: [DeployService, FileService, DeploymentsRepository],
  exports: [DeployService],
})
export class DeploymentsModule {}
