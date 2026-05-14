import { Controller, Get, UseGuards } from "@nestjs/common";
import { ServerService } from "./server.service";
import { PermissionGuard } from "../permission/permission.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionAction } from "../permission/dto/permission-action.enum";
import { Permission } from "../permission/permission.decorator";
import { ServerGateway } from "./server.gateway";

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller("server")
export class ServerController {
  static MODULE_KEY = "dashboard";
  static PROCESS_MODULE_KEY = "process";

  constructor(
    private readonly serverService: ServerService,
    private readonly gateway: ServerGateway,
  ) {}

  @Get()
  @Permission(ServerController.MODULE_KEY, PermissionAction.VIEW)
  async getStats() {
    const system = await this.serverService.getSystemStats();
    const bandwidth = await this.serverService.getBandwidth();
    const security = await this.serverService.getSecurityStatus();
    const sites = await this.serverService.getSites();
    return {
      ...system,
      bandwidth,
      security,
      sites,
    };
  }

  @Get("processes")
  @Permission(ServerController.PROCESS_MODULE_KEY, PermissionAction.VIEW)
  async getProcesses() {
    const data = await this.serverService.getProcesses();

    return {
      data,
      total: data.length,
    };
  }

  onModuleInit() {
    setInterval(async () => {
      const stats = await this.getStats(); 

      this.gateway.sendStatus(stats);
    }, 5000);
  }
}
