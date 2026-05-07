import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { PermissionAction } from "../permission/dto/permission-action.enum";
import { Permission } from "../permission/permission.decorator";
import { PermissionGuard } from "../permission/permission.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller("services")
export class ServicesController {
  static MODULE_KEY = "services";

  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Permission(ServicesController.MODULE_KEY, PermissionAction.VIEW)
  async get(
    @Query("page") page: string,
    @Query("table_size") tableSize: string,
    @Query("filter") filter: string,
    @Query("sort_by") sortBy: string,
    @Query("sort_type") sortType: string,
  ) {
    return this.servicesService.findAll({
      page: Number(page) || 1,
      tableSize: Number(tableSize) || 10,
      filter: filter ? JSON.parse(filter) : {},
      sortBy: sortBy || "id",
      sortType: (sortType as "asc" | "desc") || "desc",
    });
  }

  @Post("start")
  @Permission(ServicesController.MODULE_KEY, PermissionAction.CREATE)
  startService(@Body() dto: any, @Req() req: any) {
    const userId = req.user.id;
    return this.servicesService.startService(dto, userId);
  }

  @Post("restart")
  @Permission(ServicesController.MODULE_KEY, PermissionAction.CREATE)
  restartService(@Body() dto: any, @Req() req: any) {
    const userId = req.user.id;
    return this.servicesService.restartService(dto, userId);
  }

  @Post("stop")
  @Permission(ServicesController.MODULE_KEY, PermissionAction.CREATE)
  stopService(@Body() dto: any, @Req() req: any) {
    const userId = req.user.id;
    return this.servicesService.stopService(dto, userId);
  }
}
