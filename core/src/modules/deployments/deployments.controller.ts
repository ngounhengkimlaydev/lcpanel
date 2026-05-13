import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PermissionAction } from "../permission/dto/permission-action.enum";
import { Permission } from "../permission/permission.decorator";
import { PermissionGuard } from "../permission/permission.guard";
import { DeployService } from "./deployments.service";
import { GitProvider } from "./dto/git";
import { ImportProjectDto } from "./dto/import-project.dto";
import { PullProjectDto } from "./dto/pull-project.dto";

@Controller("deployments")
export class DeploymentsController {
  static MODULE_KEY = "git_repo";
  static DEPLOY_MODULE_KEY = "deploy";
  static HISTORY_MODULE_KEY = "git_history";
  static BUILD_LOGS_MODULE_KEY = "build_logs";

  constructor(private readonly deployment: DeployService) {}

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get()
  @Permission(DeploymentsController.DEPLOY_MODULE_KEY, PermissionAction.VIEW)
  async getDeployments(@Req() req: any) {
    const customerId = this.getCustomerId(req);

    return this.deployment.getDeploymentOverview(customerId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get("history")
  @Permission(DeploymentsController.HISTORY_MODULE_KEY, PermissionAction.VIEW)
  async getHistory(@Req() req: any) {
    const customerId = this.getCustomerId(req);

    return this.deployment.getDeploymentHistory(customerId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get("build-logs")
  @Permission(
    DeploymentsController.BUILD_LOGS_MODULE_KEY,
    PermissionAction.VIEW,
  )
  async getBuildLogs(@Req() req: any) {
    const customerId = this.getCustomerId(req);

    return this.deployment.getBuildLogs(customerId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get("connections")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.VIEW)
  async getConnections(@Req() req: any) {
    const customerId = this.getCustomerId(req);

    return this.deployment.getConnections(customerId);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(":provider/connect-url")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.CREATE)
  async getConnectUrl(
    @Param("provider") provider: GitProvider,
    @Req() req: any,
  ) {
    const customerId = this.getCustomerId(req);
    const url = await this.deployment.getConnectUrl(provider, customerId);

    return {
      data: {
        url,
      },
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get(":provider/connect")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.CREATE)
  async connectProvider(
    @Param("provider") provider: GitProvider,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const customerId = this.getCustomerId(req);

    const redirectUrl = await this.deployment.getConnectUrl(
      provider,
      customerId,
    );

    return res.redirect(redirectUrl);
  }

  @Get("oauth/callback/:provider")
  async providerCallback(
    @Param("provider") provider: GitProvider,
    @Query("code") code: string,
    @Res() res: Response,
    @Query("state") state?: string,
  ) {
    await this.deployment.handleProviderCallback({
      provider,
      code,
      state,
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/deployments/git?connected=true`,
    );
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get("repositories")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.VIEW)
  async getRepositories(
    @Req() req: any,
    @Query("provider") provider?: GitProvider,
  ) {
    const customerId = this.getCustomerId(req);

    const repositories = await this.deployment.getRepositories(
      customerId,
      provider,
    );

    return {
      data: repositories,
      total: repositories.length,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Get("projects")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.VIEW)
  async getImportedProjects(@Req() req: any) {
    const customerId = this.getCustomerId(req);

    const projects = await this.deployment.getImportedProjects(customerId);

    return {
      data: projects,
      total: projects.length,
    };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post("projects/import")
  @Permission(DeploymentsController.MODULE_KEY, PermissionAction.CREATE)
  async importProject(@Req() req: any, @Body() dto: ImportProjectDto) {
    const customerId = this.getCustomerId(req);

    return this.deployment.importProject(customerId, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Post("projects/:id/pull")
  @Permission(DeploymentsController.DEPLOY_MODULE_KEY, PermissionAction.UPDATE)
  async pullProject(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: PullProjectDto,
  ) {
    const customerId = this.getCustomerId(req);

    return this.deployment.pullProject(customerId, id, dto);
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Delete("projects/:id")
  @Permission(DeploymentsController.DEPLOY_MODULE_KEY, PermissionAction.DELETE)
  async deleteProject(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    const customerId = this.getCustomerId(req);

    return this.deployment.deleteProject(customerId, id);
  }

  private getCustomerId(req: any) {
    const customerId = req.user.id;

    if (!customerId) {
      throw new BadRequestException(
        "Git customer ID is missing. Set LCPANEL_GIT_CUSTOMER_ID to an existing customer id.",
      );
    }

    return Number(customerId);
  }
}
