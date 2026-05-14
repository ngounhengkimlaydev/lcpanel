import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn, spawnSync } from "child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import net from "node:net";
import { join, resolve } from "path";
import { ServerGateway } from "../server/server.gateway";
import { PullProjectDto } from "./dto/pull-project.dto";
import { ImportProjectDto } from "./dto/import-project.dto";
import { DeploymentsRepository } from "./deployments.repository";
import type {
  BuildLogEntry,
  BuildLogStatus,
  DeployStage,
  DeploymentManifest,
  GitCommitSnapshot,
  GitProvider,
  ImportPipelineInput,
  ProjectProvider,
  PullPipelineInput,
  RuntimeCommand,
} from "./types/deployment";

@Injectable()
export class DeployService {
  private readonly appsPath: string;
  private readonly buildLogs = new Map<number, BuildLogEntry>();
  private readonly buildLogsPath: string;
  private readonly activePipelines = new Set<string>();
  private readonly nginxSitesAvailablePath: string;
  private readonly nginxSitesEnabledPath: string;
  private readonly nginxStagePath: string;
  private readonly deployNginxUseSudo: boolean;
  private readonly deployDomainSuffix: string;

  constructor(
    private readonly config: ConfigService,
    private readonly repository: DeploymentsRepository,
    private readonly serverGateway: ServerGateway,
  ) {
    this.appsPath = this.config.get<string>("LCPANEL_APPS_PATH") || "";
    this.buildLogsPath =
      this.config.get<string>("DEPLOY_BUILD_LOGS_PATH") ||
      join(this.appsPath || process.cwd(), ".lcpanel", "build-logs");
    this.nginxSitesAvailablePath =
      this.config.get<string>("NGINX_SITES_AVAILABLE_PATH") ||
      "/etc/nginx/sites-available";
    this.nginxSitesEnabledPath =
      this.config.get<string>("NGINX_SITES_ENABLED_PATH") ||
      "/etc/nginx/sites-enabled";
    this.nginxStagePath =
      this.config.get<string>("DEPLOY_NGINX_STAGE_PATH") ||
      join(this.appsPath || process.cwd(), ".lcpanel", "nginx");
    this.deployNginxUseSudo = this.isEnabled(
      this.config.get<string>("DEPLOY_NGINX_USE_SUDO"),
    );
    this.deployDomainSuffix =
      this.config.get<string>("DEPLOY_DOMAIN_SUFFIX") || "localhost";

    mkdirSync(this.appsPath, { recursive: true });
    mkdirSync(this.buildLogsPath, { recursive: true });
    mkdirSync(this.nginxStagePath, { recursive: true });
  }

  getConnectUrl(provider: GitProvider, customerId: number) {
    this.validateProvider(provider);

    const state = Buffer.from(
      JSON.stringify({
        customerId,
        provider,
        nonce: Date.now(),
      }),
    ).toString("base64url");

    if (provider === "github") {
      const clientId = this.config.get<string>("GITHUB_CLIENT_ID");
      const redirectUri = this.config.get<string>("GITHUB_REDIRECT_URI");

      if (!clientId || !redirectUri) {
        throw new BadRequestException("GitHub OAuth config is missing");
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "repo read:user user:email",
        state,
      });

      return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    const gitlabBaseUrl =
      this.config.get<string>("GITLAB_BASE_URL") || "https://gitlab.com";

    const clientId = this.config.get<string>("GITLAB_CLIENT_ID");
    const redirectUri = this.config.get<string>("GITLAB_REDIRECT_URI");

    if (!clientId || !redirectUri) {
      throw new BadRequestException("GitLab OAuth config is missing");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "read_user read_repository",
      state,
    });

    return `${gitlabBaseUrl}/oauth/authorize?${params.toString()}`;
  }

  async handleProviderCallback(data: {
    provider: GitProvider;
    code: string;
    state?: string;
  }) {
    this.validateProvider(data.provider);

    if (!data.code) {
      throw new BadRequestException("OAuth code is missing");
    }

    const customerId = this.getCustomerIdFromState(data.state);

    if (data.provider === "github") {
      return this.handleGitHubCallback(customerId, data.code);
    }

    return this.handleGitLabCallback(customerId, data.code);
  }

  async getRepositories(customerId: number, provider?: GitProvider) {
    if (provider) {
      this.validateProvider(provider);

      if (provider === "github") {
        return this.getGitHubRepositories(customerId);
      }

      return this.getGitLabRepositories(customerId);
    }

    const result = await Promise.allSettled([
      this.getGitHubRepositories(customerId),
      this.getGitLabRepositories(customerId),
    ]);

    return result.flatMap((item) =>
      item.status === "fulfilled" ? item.value : [],
    );
  }

  async getConnections(customerId: number) {
    const connections = await this.repository.getGitConnections(customerId);

    return {
      data: connections.map((connection) => ({
        id: connection.id,
        provider: connection.provider,
        username: connection.username,
        avatarUrl: connection.avatar_url,
        scope: connection.scope,
        expiresAt: connection.expires_at,
        createdAt: connection.created_at,
        updatedAt: connection.updated_at,
      })),
    };
  }

  async getImportedProjects(customerId: number) {
    return this.repository.getGitProjects(customerId);
  }

  async getDeploymentOverview(customerId: number) {
    const [projects, histories] = await Promise.all([
      this.repository.getGitProjects(customerId),
      this.repository.getDeploymentHistories(customerId),
    ]);
    const latestHistoryByProject = this.createLatestHistoryMap(histories as any[]);
    const deployments = projects.map((project: any) =>
      this.toDeploymentItem(project, latestHistoryByProject.get(project.id)),
    );

    return {
      data: deployments,
      stats: [
        {
          label: "Total Projects",
          value: String(deployments.length),
          icon: "i-lucide-folder-git-2",
        },
        {
          label: "Successful",
          value: String(
            deployments.filter((item: any) => item.status === "success").length,
          ),
          icon: "i-lucide-circle-check",
        },
        {
          label: "Deploying",
          value: String(
            deployments.filter((item: any) => item.status === "deploying").length,
          ),
          icon: "i-lucide-loader",
        },
        {
          label: "Failed",
          value: String(
            deployments.filter((item: any) => item.status === "failed").length,
          ),
          icon: "i-lucide-circle-x",
        },
      ],
      total: deployments.length,
    };
  }

  async getDeploymentHistory(customerId: number) {
    const histories = await this.repository.getDeploymentHistories(customerId);

    if (histories.length) {
      return {
        data: histories.map((entry: any) => this.toStoredHistoryItem(entry)),
        total: histories.length,
      };
    }

    const projects = await this.repository.getGitProjects(customerId);
    const history = projects.map((project) => this.toHistoryItem(project));

    return {
      data: history,
      total: history.length,
    };
  }

  async getBuildLogs(customerId: number, projectId?: number) {
    const [plan, histories] = await Promise.all([
      this.repository.getCurrentPlan(customerId),
      this.repository.getDeploymentHistories(customerId),
    ]);
    const latestHistoryByProject = this.createLatestHistoryMap(histories);
    const packagePlan = plan?.name || "No active plan";
    const projects = projectId
      ? [
          await this.repository.findGitProjectByIdOrThrow(customerId, projectId),
        ]
      : await this.repository.getGitProjects(customerId);
    const logs = projects.map((project) =>
      this.toBuildLogItem(
        project,
        packagePlan,
        latestHistoryByProject.get(project.id),
      ),
    );

    return {
      data: logs,
      total: logs.length,
      meta: {
        packagePlan,
      },
    };
  }

  async importProject(customerId: number, dto: ImportProjectDto) {
    const projectName = this.safeProjectName(dto.projectName);
    const branch = this.safeBranchName(dto.branch);
    const lockKey = this.getPipelineKey(customerId, projectName);

    const projectPath = this.safeJoin(this.appsPath, projectName);
    const rootDirectory = dto.rootDirectory || "./";
    const buildPath = this.safeJoin(projectPath, rootDirectory);

    let connectionId: number | null = null;
    let token: string | null = null;

    if (dto.provider !== "manual") {
      const connection = await this.repository.findGitConnectionOrThrow(
        customerId,
        dto.provider,
      );

      connectionId = connection.id;
      token = connection.access_token;
    }

    const cloneUrl = this.getAuthenticatedCloneUrl(
      dto.provider,
      dto.repoUrl,
      token,
    );

    this.startPipeline(lockKey, "An import");

    try {
      const project = await this.repository.upsertGitProject(customerId, {
        provider: dto.provider,
        providerRepoId: dto.repositoryId,
        connectionId,
        name: projectName,
        fullName: dto.projectName,
        cloneUrl: dto.repoUrl,
        sshUrl: dto.sshUrl,
        htmlUrl: dto.htmlUrl,
        defaultBranch: branch,
        localPath: projectPath,
        status: "running",
      });

      const plan = await this.repository.getCurrentPlan(customerId);
      const history = await this.repository.createDeploymentHistory(
        customerId,
        project.id,
        {
          projectName,
          branch,
          status: "running",
          trigger: "import",
          message: "Import started",
          author: dto.provider || "Manual",
          planName: plan?.name || null,
        },
      );

      this.startBuildLog(customerId, project.id, projectName, branch, history.id);
      this.appendBuildLog(project.id, `Queued import for ${projectName}.`);

      void this.runImportPipeline({
        customerId,
        projectId: project.id,
        projectName,
        branch,
        cloneUrl,
        projectPath,
        buildPath,
        dto,
        lockKey,
      });

      return {
        message: "Project import started",
        data: project,
      };
    } catch (error) {
      this.releasePipeline(lockKey);
      throw error;
    }
  }

  async pullProject(customerId: number, id: number, dto: PullProjectDto) {
    const project = await this.repository.findGitProjectByIdOrThrow(
      customerId,
      id,
    );
    const projectName = project.name || project.full_name || "Untitled project";
    const lockKey = this.getPipelineKey(customerId, projectName);

    if (!project.local_path) {
      throw new NotFoundException("Project local path not found");
    }

    if (!existsSync(project.local_path)) {
      throw new NotFoundException("Project folder not found on server");
    }

    if (!existsSync(join(project.local_path, ".git"))) {
      throw new BadRequestException("Project folder is not a Git repository");
    }

    const manifest = this.readDeploymentManifest(project.local_path);
    const rootDirectory = manifest?.rootDirectory || "./";
    const buildPath = this.safeJoin(project.local_path, rootDirectory);
    const branch = manifest?.branch || project.default_branch || "main";
    this.startPipeline(lockKey, "A deployment");

    try {
      await this.repository.updateGitProject(customerId, id, {
        status: "running",
        localPath: project.local_path,
        defaultBranch: branch,
      });

      const plan = await this.repository.getCurrentPlan(customerId);
      const history = await this.repository.createDeploymentHistory(
        customerId,
        project.id,
        {
          projectName,
          branch,
          status: "running",
          trigger: "redeploy",
          message: "Redeploy started",
          author: project.connection?.username || project.provider || "Manual",
          planName: plan?.name || null,
        },
      );

      this.startBuildLog(customerId, project.id, projectName, branch, history.id);
      this.appendBuildLog(project.id, `Queued deployment for ${projectName}.`);

      void this.runPullPipeline({
        customerId,
        projectId: id,
        projectName,
        branch,
        projectPath: project.local_path,
        buildPath,
        dto,
        manifest,
        lockKey,
      });

      return {
        message: "Deployment started",
        data: {
          ...project,
          status: "running",
        },
      };
    } catch (error) {
      this.releasePipeline(lockKey);
      throw error;
    }
  }

  async deleteProject(customerId: number, id: number) {
    const project = await this.repository.findGitProjectByIdOrThrow(
      customerId,
      id,
    );

    await this.removeDeploymentRuntime(project.name || project.full_name);

    if (project.local_path) {
      this.ensureInside(this.appsPath, project.local_path);

      rmSync(project.local_path, {
        recursive: true,
        force: true,
      });
    }

    await this.repository.deleteGitProject(customerId, id);

    return {
      message: "Project deleted successfully",
    };
  }

  private async runImportPipeline(input: ImportPipelineInput) {
    const manifest = this.createDeploymentManifest(
      input.projectName,
      input.branch,
      input.dto,
    );

    try {
      if (!existsSync(input.projectPath)) {
        this.appendBuildLog(
          input.projectId,
          `Cloning repository source for ${input.branch}.`,
        );

        await this.run(
          "git",
          [
            "clone",
            "--branch",
            input.branch,
            "--depth",
            "1",
            input.cloneUrl,
            input.projectPath,
          ],
        );
      } else {
        if (!existsSync(join(input.projectPath, ".git"))) {
          throw new BadRequestException(
            "Project folder already exists but it is not a Git repository",
          );
        }

        this.appendBuildLog(
          input.projectId,
          `Project folder already exists. Pulling latest code from ${input.branch}.`,
        );
        await this.pullGitCode(
          input.projectId,
          input.projectPath,
          input.branch,
        );
      }

      this.writeDeploymentManifest(input.projectPath, manifest);
      this.appendRuntimePreferences(input.projectId, manifest);

      if (manifest.installCommand) {
        await this.runBuildStage(input.projectId, "install", async () => {
          await this.runCommandString(
            manifest.installCommand!,
            input.buildPath,
            (chunk) => this.appendBuildLog(input.projectId, chunk),
            this.getBuildEnvOverrides(manifest),
          );
        });
      }

      if (manifest.buildCommand) {
        await this.runBuildStage(input.projectId, "build", async () => {
          await this.runCommandString(
            manifest.buildCommand!,
            input.buildPath,
            (chunk) => this.appendBuildLog(input.projectId, chunk),
            this.getBuildEnvOverrides(manifest),
          );
        });
      }

      const registeredManifest = await this.registerImportedProject(
        input.projectId,
        input.projectName,
        input.projectPath,
        input.buildPath,
        manifest,
      );

      this.writeDeploymentManifest(input.projectPath, registeredManifest);

      await this.repository.updateGitProject(
        input.customerId,
        input.projectId,
        {
          status: "imported",
          localPath: input.projectPath,
          defaultBranch: input.branch,
          lastPulledAt: new Date(),
        },
      );

      this.appendBuildLog(
        input.projectId,
        `Deployment ready at ${this.toPreviewUrl(registeredManifest.domain)}.`,
      );
      await this.finalizeDeploymentHistory(
        input.customerId,
        input.projectId,
        input.projectPath,
        registeredManifest,
        "success",
        "Initial deployment completed successfully.",
      );
      this.finishBuildLog(input.projectId, "success");
    } catch (error) {
      await this.failPipeline(
        input.customerId,
        input.projectId,
        input.projectPath,
        error,
      );
    } finally {
      this.releasePipeline(input.lockKey);
    }
  }

  private async runPullPipeline(input: PullPipelineInput) {
    try {
      if (input.manifest) {
        this.appendRuntimePreferences(input.projectId, input.manifest);
      }

      await this.pullGitCode(input.projectId, input.projectPath, input.branch);

      if (input.dto.install && input.manifest?.installCommand) {
        await this.runBuildStage(input.projectId, "install", async () => {
          await this.runCommandString(
            input.manifest!.installCommand!,
            input.buildPath,
            (chunk) => this.appendBuildLog(input.projectId, chunk),
            this.getBuildEnvOverrides(input.manifest!),
          );
        });
      } else if (input.dto.install) {
        this.appendBuildLog(
          input.projectId,
          "Skipped install step because no saved install command was found.",
        );
      }

      if (input.dto.build && input.manifest?.buildCommand) {
        await this.runBuildStage(input.projectId, "build", async () => {
          await this.runCommandString(
            input.manifest!.buildCommand!,
            input.buildPath,
            (chunk) => this.appendBuildLog(input.projectId, chunk),
            this.getBuildEnvOverrides(input.manifest!),
          );
        });
      } else if (input.dto.build) {
        this.appendBuildLog(
          input.projectId,
          "Skipped build step because no saved build command was found.",
        );
      }

      let nextManifest = input.manifest;

      if (
        nextManifest &&
        (input.dto.install || input.dto.build || input.dto.restart)
      ) {
        nextManifest = await this.registerImportedProject(
          input.projectId,
          input.projectName,
          input.projectPath,
          input.buildPath,
          nextManifest,
        );

        this.writeDeploymentManifest(input.projectPath, nextManifest);
      } else if (!nextManifest) {
        this.appendBuildLog(
          input.projectId,
          "No deployment manifest found. Skipped PM2 and Nginx registration.",
        );
      }

      await this.repository.updateGitProject(
        input.customerId,
        input.projectId,
        {
          status: "pulled",
          localPath: input.projectPath,
          defaultBranch: input.branch,
          lastPulledAt: new Date(),
        },
      );

      if (nextManifest) {
        this.appendBuildLog(
          input.projectId,
          `Deployment ready at ${this.toPreviewUrl(nextManifest.domain)}.`,
        );
      }

      await this.finalizeDeploymentHistory(
        input.customerId,
        input.projectId,
        input.projectPath,
        nextManifest,
        "success",
        "Redeploy completed successfully.",
      );
      this.finishBuildLog(input.projectId, "success");
    } catch (error) {
      await this.failPipeline(
        input.customerId,
        input.projectId,
        input.projectPath,
        error,
      );
    } finally {
      this.releasePipeline(input.lockKey);
    }
  }

  private async registerImportedProject(
    projectId: number,
    projectName: string,
    projectPath: string,
    buildPath: string,
    manifest: DeploymentManifest,
  ) {
    const domain = manifest.domain || this.getDeploymentDomain(projectName);
    const staticOutputPath = this.resolveStaticOutputPath(
      buildPath,
      manifest.outputDirectory,
    );

    await this.runBuildStage(projectId, "deploy", async () => {
      if (staticOutputPath) {
        await this.configureStaticNginxSite(
          projectId,
          projectName,
          domain,
          staticOutputPath,
        );
        manifest.target = "static";
        manifest.runtime = null;
        return;
      }

      const runtime = await this.resolveRuntimeRegistration(
        projectName,
        buildPath,
        manifest,
      );

      await this.ensurePm2Process(
        projectId,
        manifest.pm2Name || projectName,
        buildPath,
        runtime,
      );
      await this.configureProxyNginxSite(
        projectId,
        projectName,
        domain,
        runtime.port,
      );

      manifest.target = "ssr";
      manifest.runtime = {
        kind: runtime.kind,
        port: runtime.port,
        domain,
      };
    });

    return {
      ...manifest,
      domain,
    };
  }

  private createDeploymentManifest(
    projectName: string,
    branch: string,
    dto: ImportProjectDto,
  ): DeploymentManifest {
    return {
      projectName,
      branch,
      domain: this.getDeploymentDomain(projectName),
      framework: dto.framework,
      rootDirectory: dto.rootDirectory || "./",
      installCommand: dto.installCommand || null,
      buildCommand: dto.buildCommand || null,
      outputDirectory: dto.outputDirectory || null,
      pm2Name: dto.pm2Name || projectName,
      nodeVersion: dto.nodeVersion || null,
      phpVersion: dto.phpVersion || null,
      target: "ssr",
      runtime: null,
    };
  }

  private getManifestPath(projectPath: string) {
    return join(projectPath, ".lcpanel-deploy.json");
  }

  private readDeploymentManifest(projectPath?: string | null) {
    if (!projectPath) {
      return null;
    }

    const manifestPath = this.getManifestPath(projectPath);

    if (!existsSync(manifestPath)) {
      return null;
    }

    try {
      return JSON.parse(
        readFileSync(manifestPath, "utf8"),
      ) as DeploymentManifest;
    } catch {
      return null;
    }
  }

  private writeDeploymentManifest(
    projectPath: string,
    manifest: DeploymentManifest,
  ) {
    writeFileSync(
      this.getManifestPath(projectPath),
      JSON.stringify(manifest, null, 2),
      "utf8",
    );
  }

  private startBuildLog(
    customerId: number,
    projectId: number,
    projectName: string,
    branch: string,
    historyId: number | null,
  ) {
    const entry: BuildLogEntry = {
      id: projectId,
      customerId,
      historyId,
      project: projectName,
      branch,
      status: "running",
      createdAt: new Date(),
      updatedAt: new Date(),
      currentStage: null,
      installTime: "-",
      buildTime: "-",
      deployTime: "-",
      output: [],
    };

    this.buildLogs.set(projectId, entry);
    this.persistBuildLog(entry);
    this.emitBuildLogSnapshot(entry);
  }

  private appendBuildLog(projectId: number, chunk: string) {
    const entry = this.buildLogs.get(projectId);

    if (!entry) {
      return;
    }

    const lines = chunk.replace(/\r/g, "").split("\n");

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      entry.output.push(line);
      entry.updatedAt = new Date();
      this.emitBuildLogAppend(entry, line);
    }

    entry.updatedAt = new Date();
    this.persistBuildLog(entry);
  }

  private async runBuildStage(
    projectId: number,
    stage: DeployStage,
    action: () => Promise<void>,
  ) {
    const entry = this.buildLogs.get(projectId);
    const startedAt = Date.now();

    if (entry) {
      entry.currentStage = stage;

      if (stage === "install") entry.installTime = "Running";
      if (stage === "build") entry.buildTime = "Running";
      if (stage === "deploy") entry.deployTime = "Running";
      this.emitBuildLogSnapshot(entry);
    }

    await action();

    const duration = this.formatDuration(Date.now() - startedAt);

    if (entry) {
      entry.currentStage = null;
      entry.updatedAt = new Date();

      if (stage === "install") entry.installTime = duration;
      if (stage === "build") entry.buildTime = duration;
      if (stage === "deploy") entry.deployTime = duration;
      this.persistBuildLog(entry);
      this.emitBuildLogSnapshot(entry);
    }
  }

  private finishBuildLog(projectId: number, status: BuildLogStatus) {
    const entry = this.buildLogs.get(projectId);

    if (!entry) {
      return;
    }

    entry.status = status;
    entry.currentStage = null;
    entry.updatedAt = new Date();
    this.persistBuildLog(entry);
    this.emitBuildLogSnapshot(entry);
  }

  private async failPipeline(
    customerId: number,
    projectId: number,
    projectPath: string,
    error: unknown,
  ) {
    const message =
      error instanceof Error
        ? error.message
        : String(error || "Deployment failed");

    const entry = this.buildLogs.get(projectId);

    if (entry?.currentStage === "install") entry.installTime = "Failed";
    if (entry?.currentStage === "build") entry.buildTime = "Failed";
    if (entry?.currentStage === "deploy") entry.deployTime = "Failed";

    this.appendBuildLog(projectId, message);
    this.finishBuildLog(projectId, "failed");

    await this.repository.updateGitProject(customerId, projectId, {
      status: "failed",
    });

    await this.finalizeDeploymentHistory(
      customerId,
      projectId,
      projectPath,
      this.readDeploymentManifest(projectPath),
      "failed",
      message,
    );
  }

  private async finalizeDeploymentHistory(
    customerId: number,
    projectId: number,
    projectPath: string,
    manifest: DeploymentManifest | null,
    status: BuildLogStatus,
    fallbackMessage: string,
  ) {
    const entry = this.buildLogs.get(projectId) || this.readStoredBuildLog(projectId);

    if (!entry?.historyId) {
      return;
    }

    const commit = this.readGitCommitSnapshot(projectPath);
    const plan = await this.repository.getCurrentPlan(customerId);
    const durationMs = entry.updatedAt.getTime() - entry.createdAt.getTime();

    await this.repository.updateDeploymentHistory(entry.historyId, {
      branch: manifest?.branch || entry.branch,
      commitHash: commit?.hash ?? null,
      commitShort: commit?.shortHash ?? null,
      commitMessage: commit?.subject ?? null,
      author: commit?.author ?? null,
      status,
      message: commit?.subject || fallbackMessage,
      domain: manifest?.domain ? this.toPreviewUrl(manifest.domain) : null,
      installTime: entry.installTime,
      buildTime: entry.buildTime,
      deployTime: entry.deployTime,
      durationMs,
      planName: plan?.name || null,
      environment: "Production",
    });

    const currentEntry = this.buildLogs.get(projectId);

    if (currentEntry) {
      currentEntry.historyId = entry.historyId;
    }
  }

  private emitBuildLogSnapshot(entry: BuildLogEntry) {
    this.serverGateway.sendDeploymentLog(entry.customerId, {
      type: "snapshot",
      log: this.toSocketBuildLog(entry, true),
    });
  }

  private emitBuildLogAppend(entry: BuildLogEntry, outputChunk: string) {
    this.serverGateway.sendDeploymentLog(entry.customerId, {
      type: "append",
      outputChunk,
      log: this.toSocketBuildLog(entry, false),
    });
  }

  private toSocketBuildLog(entry: BuildLogEntry, includeOutput: boolean) {
    return {
      id: entry.id,
      project: entry.project,
      branch: entry.branch,
      commit: "-",
      status: entry.status,
      duration: this.formatDuration(
        entry.updatedAt.getTime() - entry.createdAt.getTime(),
      ),
      createdAt: entry.createdAt.toISOString(),
      installTime: entry.installTime,
      buildTime: entry.buildTime,
      deployTime: entry.deployTime,
      output: includeOutput ? entry.output.join("\n") : undefined,
    };
  }

  private formatDuration(durationMs: number) {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }

    if (durationMs < 60_000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    }

    return `${(durationMs / 60_000).toFixed(1)}m`;
  }

  private resolveStaticOutputPath(
    buildPath: string,
    outputDirectory?: string | null,
  ) {
    const candidates = [
      outputDirectory ? this.safeJoin(buildPath, outputDirectory) : null,
      join(buildPath, ".output", "public"),
      join(buildPath, "dist"),
      join(buildPath, "build"),
      join(buildPath, "public"),
    ].filter(Boolean) as string[];

    return (
      candidates.find(
        (candidate) =>
          existsSync(candidate) && existsSync(join(candidate, "index.html")),
      ) || null
    );
  }

  private async resolveRuntimeRegistration(
    projectName: string,
    buildPath: string,
    manifest: DeploymentManifest,
  ): Promise<RuntimeCommand> {
    const preferredPort = manifest.runtime?.port;
    const port = preferredPort || (await this.findAvailablePort(4100));
    const nuxtEntry = join(buildPath, ".output", "server", "index.mjs");
    const nextEntry = join(
      buildPath,
      "node_modules",
      "next",
      "dist",
      "bin",
      "next",
    );
    const nestEntry = join(buildPath, "dist", "main.js");
    const nodeEntry = [
      join(buildPath, "server.js"),
      join(buildPath, "app.js"),
      join(buildPath, "index.js"),
    ].find((candidate) => existsSync(candidate));

    if (existsSync(nuxtEntry)) {
      return {
        kind: "nuxt" as const,
        command: "node",
        args: [nuxtEntry],
        port,
        env: {
          PORT: String(port),
          HOST: "127.0.0.1",
          NITRO_HOST: "127.0.0.1",
          NITRO_PORT: String(port),
        },
      };
    }

    if (existsSync(nextEntry)) {
      return {
        kind: "next" as const,
        command: "node",
        args: [nextEntry, "start", "-p", String(port), "-H", "127.0.0.1"],
        port,
        env: {
          PORT: String(port),
          HOSTNAME: "127.0.0.1",
        },
      };
    }

    if (existsSync(nestEntry)) {
      return {
        kind: "node" as const,
        command: "node",
        args: [nestEntry],
        port,
        env: {
          PORT: String(port),
          HOST: "127.0.0.1",
        },
      };
    }

    if (nodeEntry) {
      return {
        kind: "node" as const,
        command: "node",
        args: [nodeEntry],
        port,
        env: {
          PORT: String(port),
          HOST: "127.0.0.1",
        },
      };
    }

    throw new BadRequestException(
      `Unable to detect an SSR runtime entry for ${projectName} (${manifest.framework})`,
    );
  }

  private async ensurePm2Process(
    projectId: number,
    pm2Name: string,
    buildPath: string,
    runtime: RuntimeCommand,
  ) {
    const safeName = this.safePm2Name(pm2Name);

    this.appendBuildLog(
      projectId,
      `Preparing production runtime for ${safeName}.`,
    );
    await this.runAllowFailure(
      "pm2",
      ["delete", safeName],
    );

    this.appendBuildLog(
      projectId,
      "Starting application.",
    );
    await this.run(
      "pm2",
      [
        "start",
        runtime.command,
        "--name",
        safeName,
        "--cwd",
        buildPath,
        "--",
        ...runtime.args,
      ],
      undefined,
      undefined,
      runtime.env,
    );

    this.appendBuildLog(
      projectId,
      `Application is running on port ${runtime.port}.`,
    );
  }

  private async configureStaticNginxSite(
    projectId: number,
    projectName: string,
    domain: string,
    outputPath: string,
  ) {
    const config = [
      "server {",
      "  listen 80;",
      `  server_name ${domain};`,
      `  root ${outputPath};`,
      "  index index.html;",
      "",
      "  location / {",
      "    try_files $uri $uri/ /index.html;",
      "  }",
      "}",
      "",
    ].join("\n");

    await this.installNginxSite(projectId, projectName, config);
  }

  private async configureProxyNginxSite(
    projectId: number,
    projectName: string,
    domain: string,
    port: number,
  ) {
    const config = [
      "server {",
      "  listen 80;",
      `  server_name ${domain};`,
      "",
      "  location / {",
      `    proxy_pass http://127.0.0.1:${port};`,
      "    proxy_http_version 1.1;",
      "    proxy_set_header Upgrade $http_upgrade;",
      "    proxy_set_header Connection \"upgrade\";",
      "    proxy_set_header Host $host;",
      "    proxy_set_header X-Real-IP $remote_addr;",
      "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
      "    proxy_set_header X-Forwarded-Proto $scheme;",
      "  }",
      "}",
      "",
    ].join("\n");

    await this.installNginxSite(projectId, projectName, config);
  }

  private async installNginxSite(
    projectId: number,
    projectName: string,
    config: string,
  ) {
    const fileName = `${this.safeProjectName(projectName)}.conf`;
    const stagedPath = join(this.nginxStagePath, fileName);
    const availablePath = join(this.nginxSitesAvailablePath, fileName);
    const enabledPath = join(this.nginxSitesEnabledPath, fileName);

    writeFileSync(stagedPath, config, "utf8");

    try {
      if (this.deployNginxUseSudo) {
        await this.installNginxSiteWithSudo(
          projectId,
          stagedPath,
          availablePath,
          enabledPath,
        );
        return;
      }

      await this.installNginxSiteDirect(
        projectId,
        stagedPath,
        availablePath,
        enabledPath,
      );
    } catch (error) {
      if (this.isPermissionError(error) && !this.deployNginxUseSudo) {
        this.appendBuildLog(
          projectId,
          "Direct Nginx write failed due to permissions. Retrying with sudo -n.",
        );

        await this.installNginxSiteWithSudo(
          projectId,
          stagedPath,
          availablePath,
          enabledPath,
        );
        return;
      }

      if (this.isPermissionError(error)) {
        throw this.toNginxPermissionError(error);
      }

      throw error;
    }
  }

  private async removeDeploymentRuntime(projectName: string) {
    const safeName = this.safeProjectName(projectName);
    const fileName = `${safeName}.conf`;
    const stagedPath = join(this.nginxStagePath, fileName);
    const availablePath = join(this.nginxSitesAvailablePath, fileName);
    const enabledPath = join(this.nginxSitesEnabledPath, fileName);

    await this.runAllowFailure("pm2", ["delete", safeName]);

    rmSync(stagedPath, { force: true });

    try {
      if (this.deployNginxUseSudo) {
        await this.removeNginxSiteWithSudo(availablePath, enabledPath);
        return;
      }

      await this.removeNginxSiteDirect(availablePath, enabledPath);
    } catch (error) {
      if (this.isPermissionError(error) && !this.deployNginxUseSudo) {
        await this.removeNginxSiteWithSudo(availablePath, enabledPath);
        return;
      }

      if (this.isPermissionError(error)) {
        throw this.toNginxPermissionError(error);
      }

      throw error;
    }
  }

  private async installNginxSiteDirect(
    projectId: number,
    stagedPath: string,
    availablePath: string,
    enabledPath: string,
  ) {
    mkdirSync(this.nginxSitesAvailablePath, { recursive: true });
    mkdirSync(this.nginxSitesEnabledPath, { recursive: true });

    copyFileSync(stagedPath, availablePath);

    if (existsSync(enabledPath)) {
      rmSync(enabledPath, { force: true });
    }

    symlinkSync(availablePath, enabledPath);

    await this.run("nginx", ["-t"], undefined, (chunk) =>
      this.appendBuildLog(projectId, chunk),
    );
    await this.run("nginx", ["-s", "reload"], undefined, (chunk) =>
      this.appendBuildLog(projectId, chunk),
    );
  }

  private async installNginxSiteWithSudo(
    projectId: number,
    stagedPath: string,
    availablePath: string,
    enabledPath: string,
  ) {
    this.appendBuildLog(
      projectId,
      "Installing Nginx config with sudo -n.",
    );

    await this.runLoggedCommand(projectId, "sudo", [
      "-n",
      "mkdir",
      "-p",
      this.nginxSitesAvailablePath,
      this.nginxSitesEnabledPath,
    ]);
    await this.runLoggedCommand(projectId, "sudo", [
      "-n",
      "cp",
      stagedPath,
      availablePath,
    ]);
    await this.runAllowFailure(
      "sudo",
      ["-n", "rm", "-f", enabledPath],
      undefined,
      (chunk) => this.appendBuildLog(projectId, chunk),
    );
    await this.runLoggedCommand(projectId, "sudo", [
      "-n",
      "ln",
      "-sfn",
      availablePath,
      enabledPath,
    ]);
    await this.runLoggedCommand(projectId, "sudo", ["-n", "nginx", "-t"]);
    await this.runLoggedCommand(projectId, "sudo", [
      "-n",
      "nginx",
      "-s",
      "reload",
    ]);
  }

  private async removeNginxSiteDirect(
    availablePath: string,
    enabledPath: string,
  ) {
    let nginxChanged = false;

    if (existsSync(enabledPath)) {
      rmSync(enabledPath, { force: true });
      nginxChanged = true;
    }

    if (existsSync(availablePath)) {
      rmSync(availablePath, { force: true });
      nginxChanged = true;
    }

    if (!nginxChanged) {
      return;
    }

    await this.runAllowFailure("nginx", ["-t"]);
    await this.runAllowFailure("nginx", ["-s", "reload"]);
  }

  private async removeNginxSiteWithSudo(
    availablePath: string,
    enabledPath: string,
  ) {
    await this.runAllowFailure("sudo", ["-n", "rm", "-f", enabledPath]);
    await this.runAllowFailure("sudo", ["-n", "rm", "-f", availablePath]);
    await this.runAllowFailure("sudo", ["-n", "nginx", "-t"]);
    await this.runAllowFailure("sudo", ["-n", "nginx", "-s", "reload"]);
  }

  private isPermissionError(error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "EACCES"
    ) {
      return true;
    }

    if (error instanceof Error) {
      return /permission denied|EACCES|sudo: a password is required|sudo: a password is required|sudo: no tty present/i.test(
        error.message,
      );
    }

    return false;
  }

  private toNginxPermissionError(error: unknown) {
    const details =
      error instanceof Error ? error.message : String(error || "unknown error");

    return new BadRequestException(
      "Nginx registration needs elevated permissions. Enable DEPLOY_NGINX_USE_SUDO=true and allow the app user to run sudo -n for cp, ln, rm, mkdir, and nginx reload commands. " +
        `Original error: ${details}`,
    );
  }

  private isEnabled(value?: string | null) {
    return ["1", "true", "yes", "on"].includes(
      String(value || "").toLowerCase(),
    );
  }

  private getDeploymentDomain(projectName: string) {
    const suffix = this.deployDomainSuffix.replace(/^\.+/, "");

    return `${projectName}.${suffix}`;
  }

  private toPreviewUrl(domain: string) {
    return `http://${domain}`;
  }

  private findAvailablePort(startPort: number) {
    return new Promise<number>((resolvePromise, rejectPromise) => {
      const tryPort = (port: number) => {
        if (port > 65_000) {
          rejectPromise(new BadRequestException("No available port found"));
          return;
        }

        const server = net.createServer();

        server.once("error", () => {
          server.close();
          tryPort(port + 1);
        });

        server.once("listening", () => {
          server.close(() => resolvePromise(port));
        });

        server.listen(port, "127.0.0.1");
      };

      tryPort(startPort);
    });
  }

  private runLoggedCommand(
    projectId: number,
    command: string,
    args: string[],
    cwd?: string,
    envOverrides?: NodeJS.ProcessEnv,
  ) {
    return this.run(
      command,
      args,
      cwd,
      (chunk) => this.appendBuildLog(projectId, chunk),
      envOverrides,
    );
  }

  private runAllowFailure(
    command: string,
    args: string[],
    cwd?: string,
    onOutput?: (chunk: string) => void,
    envOverrides?: NodeJS.ProcessEnv,
  ) {
    return this.run(command, args, cwd, onOutput, envOverrides).catch(
      () => undefined,
    );
  }

  private async handleGitHubCallback(customerId: number, code: string) {
    const clientId = this.config.get<string>("GITHUB_CLIENT_ID");
    const clientSecret = this.config.get<string>("GITHUB_CLIENT_SECRET");
    const redirectUri = this.config.get<string>("GITHUB_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException("GitHub OAuth config is missing");
    }

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new BadRequestException("GitHub authentication failed");
    }

    const profile = await this.getGitHubProfile(data.access_token);

    const connection = await this.repository.upsertGitConnection(customerId, {
      provider: "github",
      providerUserId: String(profile.id),
      username: profile.login ?? null,
      avatarUrl: profile.avatar_url ?? null,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      scope: data.scope ?? null,
      expiresAt: null,
    });

    return {
      message: "GitHub connected successfully",
      provider: "github",
      data: connection,
    };
  }

  private async handleGitLabCallback(customerId: number, code: string) {
    const gitlabBaseUrl =
      this.config.get<string>("GITLAB_BASE_URL") || "https://gitlab.com";

    const clientId = this.config.get<string>("GITLAB_CLIENT_ID");
    const clientSecret = this.config.get<string>("GITLAB_CLIENT_SECRET");
    const redirectUri = this.config.get<string>("GITLAB_REDIRECT_URI");

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException("GitLab OAuth config is missing");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const response = await fetch(`${gitlabBaseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new BadRequestException("GitLab authentication failed");
    }

    const profile = await this.getGitLabProfile(data.access_token);

    const expiresAt = data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000)
      : null;

    const connection = await this.repository.upsertGitConnection(customerId, {
      provider: "gitlab",
      providerUserId: String(profile.id),
      username: profile.username ?? null,
      avatarUrl: profile.avatar_url ?? null,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? null,
      scope: data.scope ?? null,
      expiresAt,
    });

    return {
      message: "GitLab connected successfully",
      provider: "gitlab",
      data: connection,
    };
  }

  private async getGitHubProfile(token: string) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new BadRequestException("Failed to fetch GitHub profile");
    }

    return response.json();
  }

  private async getGitLabProfile(token: string) {
    const gitlabBaseUrl =
      this.config.get<string>("GITLAB_BASE_URL") || "https://gitlab.com";

    const response = await fetch(`${gitlabBaseUrl}/api/v4/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException("Failed to fetch GitLab profile");
    }

    return response.json();
  }

  private async getGitHubRepositories(customerId: number) {
    const connection = await this.repository.findGitConnection(
      customerId,
      "github",
    );

    if (!connection) return [];

    const response = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&visibility=all",
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException("Failed to fetch GitHub repositories");
    }

    const repos = await response.json();

    return repos.map((repo: any) => ({
      id: repo.id,
      repositoryId: String(repo.id),
      provider: "github",
      name: repo.full_name,
      description: repo.description || "No description",
      branch: repo.default_branch || "main",
      framework: this.detectFramework(repo.language),
      repoUrl: repo.clone_url,
      sshUrl: repo.ssh_url,
      htmlUrl: repo.html_url,
      private: repo.private,
      updatedAt: repo.updated_at,
    }));
  }

  private async getGitLabRepositories(customerId: number) {
    const connection = await this.repository.findGitConnection(
      customerId,
      "gitlab",
    );

    if (!connection) return [];

    const gitlabBaseUrl =
      this.config.get<string>("GITLAB_BASE_URL") || "https://gitlab.com";

    const response = await fetch(
      `${gitlabBaseUrl}/api/v4/projects?membership=true&per_page=100&order_by=last_activity_at&sort=desc&simple=true`,
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException("Failed to fetch GitLab repositories");
    }

    const repos = await response.json();

    return repos.map((repo: any) => ({
      id: repo.id,
      repositoryId: String(repo.id),
      provider: "gitlab",
      name: repo.path_with_namespace,
      description: repo.description || "No description",
      branch: repo.default_branch || "main",
      framework: "Unknown",
      repoUrl: repo.http_url_to_repo,
      sshUrl: repo.ssh_url_to_repo,
      htmlUrl: repo.web_url,
      private: repo.visibility !== "public",
      updatedAt: repo.last_activity_at,
    }));
  }

  private getAuthenticatedCloneUrl(
    provider: ProjectProvider,
    repoUrl: string,
    token?: string | null,
  ) {
    if (provider === "manual") {
      return repoUrl;
    }

    if (!token) {
      throw new BadRequestException(`${provider} is not connected`);
    }

    if (provider === "github") {
      return repoUrl.replace(
        "https://github.com/",
        `https://x-access-token:${token}@github.com/`,
      );
    }

    if (provider === "gitlab") {
      const url = new URL(repoUrl);

      url.username = "oauth2";
      url.password = token;

      return url.toString();
    }

    throw new BadRequestException("Invalid Git provider");
  }

  private getCustomerIdFromState(state?: string) {
    if (!state) {
      throw new BadRequestException("OAuth state is missing");
    }

    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString());

      if (!parsed.customerId || Number.isNaN(Number(parsed.customerId))) {
        throw new BadRequestException("Invalid OAuth state");
      }

      return Number(parsed.customerId);
    } catch {
      throw new BadRequestException("Invalid OAuth state");
    }
  }

  private async pullGitCode(
    projectId: number,
    projectPath: string,
    branch: string,
  ) {
    this.appendBuildLog(projectId, `Syncing latest source from ${branch}.`);
    await this.run("git", ["fetch", "origin", branch], projectPath);
    await this.run("git", ["checkout", branch], projectPath);
    await this.run("git", ["reset", "--hard", `origin/${branch}`], projectPath);
    this.appendBuildLog(projectId, "Source sync completed.");
  }

  private async restartPm2(pm2Name: string) {
    const safeName = this.safePm2Name(pm2Name);

    await this.run("pm2", ["restart", safeName, "--update-env"]);
  }

  private runCommandString(
    command: string,
    cwd: string,
    onOutput?: (chunk: string) => void,
    envOverrides?: NodeJS.ProcessEnv,
  ) {
    const parsed = this.parseCommand(command);

    const allowedCommands = [
      "pnpm",
      "npm",
      "yarn",
      "bun",
      "node",
      "npx",
      "nuxt",
      "nest",
      "composer",
      "php",
      "pm2",
    ];

    if (!allowedCommands.includes(parsed.command)) {
      throw new BadRequestException(
        `Command "${parsed.command}" is not allowed`,
      );
    }

    return this.run(parsed.command, parsed.args, cwd, onOutput, envOverrides);
  }

  private getBuildEnvOverrides(manifest: DeploymentManifest) {
    const env: NodeJS.ProcessEnv = {};

    if (manifest.nodeVersion) {
      env.NODE_VERSION = manifest.nodeVersion;
      env.NIXPACKS_NODE_VERSION = manifest.nodeVersion;
      env.LCPANEL_NODE_VERSION = manifest.nodeVersion;
    }

    if (manifest.phpVersion) {
      env.PHP_VERSION = manifest.phpVersion;
      env.NIXPACKS_PHP_VERSION = manifest.phpVersion;
      env.LCPANEL_PHP_VERSION = manifest.phpVersion;
    }

    return env;
  }

  private appendRuntimePreferences(
    projectId: number,
    manifest: DeploymentManifest,
  ) {
    const versions: string[] = [];

    if (manifest.nodeVersion) {
      versions.push(`Node ${manifest.nodeVersion}`);
    }

    if (manifest.phpVersion) {
      versions.push(`PHP ${manifest.phpVersion}`);
    }

    if (!versions.length) {
      return;
    }

    this.appendBuildLog(
      projectId,
      `Runtime preference: ${versions.join(" / ")}.`,
    );
  }

  private parseCommand(commandString: string) {
    const parts = commandString.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

    if (!parts.length) {
      throw new BadRequestException("Command is empty");
    }

    const [command, ...args] = parts.map((part) => part.replace(/^"|"$/g, ""));

    for (const arg of args) {
      if (/[;&|`$<>]/.test(arg)) {
        throw new BadRequestException("Unsafe command argument detected");
      }
    }

    return {
      command,
      args,
    };
  }

  private run(
    command: string,
    args: string[],
    cwd?: string,
    onOutput?: (chunk: string) => void,
    envOverrides?: NodeJS.ProcessEnv,
  ) {
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const child = spawn(command, args, {
        cwd,
        shell: false,
        env: {
          ...process.env,
          ...envOverrides,
        },
      });

      let stderr = "";

      child.stdout.on("data", (data) => {
        const chunk = data.toString();

        console.log(`[${command}] ${chunk}`);
        onOutput?.(chunk);
      });

      child.stderr.on("data", (data) => {
        const chunk = data.toString();

        stderr += chunk;
        console.error(`[${command}] ${chunk}`);
        onOutput?.(chunk);
      });

      child.on("error", (error) => {
        rejectPromise(
          new BadRequestException(error.message || `${command} failed`),
        );
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolvePromise();
          return;
        }

        rejectPromise(
          new BadRequestException(
            stderr || `${command} failed with code ${code}`,
          ),
        );
      });
    });
  }

  private validateProvider(provider: string): asserts provider is GitProvider {
    if (!["github", "gitlab"].includes(provider)) {
      throw new BadRequestException("Invalid Git provider");
    }
  }

  private safeProjectName(name: string) {
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      throw new BadRequestException("Invalid project name");
    }

    return name;
  }

  private safeBranchName(branch: string) {
    if (!/^[a-zA-Z0-9._/-]+$/.test(branch)) {
      throw new BadRequestException("Invalid branch name");
    }

    return branch;
  }

  private safePm2Name(name: string) {
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      throw new BadRequestException("Invalid PM2 name");
    }

    return name;
  }

  private safeJoin(basePath: string, targetPath: string) {
    const finalPath = resolve(join(basePath, targetPath));

    this.ensureInside(basePath, finalPath);

    return finalPath;
  }

  private ensureInside(basePath: string, targetPath: string) {
    const base = resolve(basePath);
    const target = resolve(targetPath);

    if (!target.startsWith(base)) {
      throw new BadRequestException("Invalid path");
    }
  }

  private detectFramework(language?: string) {
    if (!language) return "Unknown";

    const value = String(language).toLowerCase();

    if (value.includes("vue")) return "Nuxt/Vue";
    if (value.includes("typescript")) return "Node.js";
    if (value.includes("javascript")) return "Node.js";
    if (value.includes("php")) return "Laravel/PHP";
    if (value.includes("html")) return "Static HTML";

    return language;
  }

  private toDeploymentItem(project: any, latestHistory?: any) {
    const manifest = this.readDeploymentManifest(project.local_path);
    const liveLog = this.buildLogs.get(project.id);
    const commit = latestHistory?.commit_short || this.readGitCommitSnapshot(project.local_path)?.shortHash || "-";
    const status =
      liveLog?.status === "running"
        ? "deploying"
        : latestHistory?.status === "failed"
          ? "failed"
          : this.toDeployStatus(project.status);
    const name = project.name || project.full_name || "Untitled project";
    const branch = project.default_branch || "main";
    const framework =
      manifest?.framework || this.detectFrameworkFromProject(project);
    const domain =
      latestHistory?.domain ||
      (manifest?.domain
        ? this.toPreviewUrl(manifest.domain)
        : this.toPreviewUrl(this.getDeploymentDomain(name)));

    return {
      id: project.id,
      name,
      description:
        project.full_name || project.clone_url || "Imported Git project",
      framework,
      branch,
      environment: "Production",
      domain,
      commit,
      lastDeploy:
        liveLog?.updatedAt.toISOString() ||
        latestHistory?.created_at?.toISOString?.() ||
        project.last_pulled_at?.toISOString?.() ||
        project.updated_at?.toISOString?.() ||
        "-",
      buildTime:
        liveLog?.buildTime ||
        latestHistory?.build_time ||
        (status === "deploying" ? "Running" : "-"),
      status,
      icon: this.getFrameworkIcon(framework),
      provider: project.provider,
      repoUrl: project.clone_url,
      localPath: project.local_path,
      nodeVersion: manifest?.nodeVersion || null,
      phpVersion: manifest?.phpVersion || null,
    };
  }

  private toHistoryItem(project: any) {
    const liveLog = this.buildLogs.get(project.id);
    const manifest = this.readDeploymentManifest(project.local_path);
    const status = liveLog?.status || this.toHistoryStatus(project.status);
    const deployedAt = project.last_pulled_at || project.updated_at;
    const commit =
      this.readGitCommitSnapshot(project.local_path)?.shortHash || "-";

    return {
      id: project.id,
      projectId: project.id,
      project: project.name || project.full_name || "Untitled project",
      message:
        liveLog?.status === "running"
          ? "Deployment is running"
          : project.last_pulled_at
            ? "Pulled latest source code"
            : "Imported Git repository",
      branch: project.default_branch || "main",
      commit,
      status,
      environment: "Production",
      author: project.connection?.username || project.provider || "Manual",
      deployedAt: deployedAt?.toISOString?.() || "-",
      duration: status === "running" ? "Running" : "-",
      version: `#${project.id}`,
      domain:
        project.html_url ||
        (manifest?.domain
          ? this.toPreviewUrl(manifest.domain)
          : "-"),
    };
  }

  private toStoredHistoryItem(entry: any) {
    return {
      id: entry.id,
      projectId: entry.project_id,
      project: entry.project_name,
      message: entry.message,
      branch: entry.branch,
      commit: entry.commit_short || "-",
      status: entry.status,
      environment: entry.environment || "Production",
      author: entry.author || "Manual",
      deployedAt: entry.created_at?.toISOString?.() || "-",
      duration:
        entry.duration_ms != null
          ? this.formatDuration(entry.duration_ms)
          : entry.status === "running"
            ? "Running"
            : "-",
      version: `DEP-${String(entry.id).padStart(4, "0")}`,
      domain: entry.domain || "-",
    };
  }

  private toBuildLogItem(project: any, packagePlan: string, latestHistory?: any) {
    const liveLog =
      this.buildLogs.get(project.id) || this.readStoredBuildLog(project.id);
    const manifest = this.readDeploymentManifest(project.local_path);
    const commit =
      latestHistory?.commit_short ||
      this.readGitCommitSnapshot(project.local_path)?.shortHash ||
      "-";
    const domain =
      latestHistory?.domain ||
      (manifest?.domain
        ? this.toPreviewUrl(manifest.domain)
        : this.extractDomainFromStoredLog(liveLog) ||
          this.toPreviewUrl(this.getDeploymentDomain(project.name || project.full_name || "app")));

    if (liveLog) {
      if (!this.buildLogs.has(project.id)) {
        this.buildLogs.set(project.id, liveLog);
      }

      return {
        id: project.id,
        project: liveLog.project,
        branch: liveLog.branch,
        commit,
        status: liveLog.status,
        duration: this.formatDuration(
          liveLog.updatedAt.getTime() - liveLog.createdAt.getTime(),
        ),
        createdAt: liveLog.createdAt.toISOString(),
        installTime: liveLog.installTime,
        buildTime: liveLog.buildTime,
        deployTime: liveLog.deployTime,
        output: liveLog.output.join("\n"),
        packagePlan,
        nodeVersion: manifest?.nodeVersion || "System default",
        phpVersion: manifest?.phpVersion || "System default",
        domain,
      };
    }

    const status = this.toHistoryStatus(project.status);
    const branch = project.default_branch || "main";
    const projectName = project.name || project.full_name || "Untitled project";

    return {
      id: project.id,
      project: projectName,
      branch,
      commit,
      status,
      duration: status === "running" ? "Running" : "-",
      createdAt: project.updated_at?.toISOString?.() || "-",
      installTime: "-",
      buildTime: status === "running" ? "Running" : "-",
      deployTime: "-",
      output: this.buildLogOutput(projectName, branch, project.status),
      packagePlan,
      nodeVersion: manifest?.nodeVersion || "System default",
      phpVersion: manifest?.phpVersion || "System default",
      domain,
    };
  }

  private toDeployStatus(status?: string) {
    if (status === "failed") return "failed";
    if (status === "deploying" || status === "running") return "deploying";
    if (status === "imported" || status === "pulled") return "success";

    return "pending";
  }

  private toHistoryStatus(status?: string) {
    if (status === "failed") return "failed";
    if (status === "deploying" || status === "running") return "running";
    if (status === "cancelled") return "cancelled";
    if (status === "imported" || status === "pulled") return "success";

    return "cancelled";
  }

  private detectFrameworkFromProject(project: any) {
    const name =
      `${project.name || ""} ${project.full_name || ""}`.toLowerCase();

    if (name.includes("nuxt")) return "Nuxt";
    if (name.includes("next")) return "Next.js";
    if (name.includes("nest")) return "NestJS";
    if (name.includes("laravel")) return "Laravel";
    if (name.includes("vue")) return "Vue";
    if (name.includes("react")) return "React";

    return "Node.js";
  }

  private getFrameworkIcon(framework: string) {
    const value = framework.toLowerCase();

    if (value.includes("nuxt")) return "i-simple-icons-nuxtdotjs";
    if (value.includes("next")) return "i-simple-icons-nextdotjs";
    if (value.includes("nest")) return "i-simple-icons-nestjs";
    if (value.includes("laravel")) return "i-simple-icons-laravel";
    if (value.includes("vue")) return "i-simple-icons-vuedotjs";
    if (value.includes("react")) return "i-simple-icons-react";

    return "i-lucide-rocket";
  }

  private buildLogOutput(projectName: string, branch: string, status?: string) {
    const lines = [`Preparing deployment build log for ${projectName}.`];

    if (status === "pulled") {
      lines.push(`Latest build for ${branch} completed successfully.`);
    } else if (status === "imported") {
      lines.push(`Project ${projectName} imported successfully.`);
    } else if (status === "failed") {
      lines.push("Deployment failed. Check server logs for the command error.");
    } else {
      lines.push("Build log is being prepared. Waiting for live websocket updates...");
    }

    return lines.join("\n");
  }

  private getBuildLogPath(projectId: number) {
    return join(this.buildLogsPath, `${projectId}.json`);
  }

  private persistBuildLog(entry: BuildLogEntry) {
    writeFileSync(
      this.getBuildLogPath(entry.id),
      JSON.stringify(
        {
          ...entry,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString(),
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  private readStoredBuildLog(projectId: number): BuildLogEntry | null {
    const path = this.getBuildLogPath(projectId);

    if (!existsSync(path)) {
      return null;
    }

    try {
      const parsed = JSON.parse(readFileSync(path, "utf8"));

      return {
        ...parsed,
        customerId: parsed.customerId ? Number(parsed.customerId) : 0,
        historyId:
          parsed.historyId == null ? null : Number(parsed.historyId),
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      } as BuildLogEntry;
    } catch {
      return null;
    }
  }

  private createLatestHistoryMap(histories: any[]) {
    const latestHistoryByProject = new Map<number, any>();

    for (const entry of histories) {
      if (!latestHistoryByProject.has(entry.project_id)) {
        latestHistoryByProject.set(entry.project_id, entry);
      }
    }

    return latestHistoryByProject;
  }

  private extractDomainFromStoredLog(entry: BuildLogEntry | null) {
    if (!entry?.output?.length) {
      return null;
    }

    const match = entry.output
      .join("\n")
      .match(/Deployment ready at (https?:\/\/[^\s]+)/);

    return match?.[1]?.replace(/\.$/, "") || null;
  }

  private readGitCommitSnapshot(projectPath?: string | null): GitCommitSnapshot | null {
    if (!projectPath || !existsSync(join(projectPath, ".git"))) {
      return null;
    }

    const result = spawnSync(
      "git",
      ["log", "-1", "--pretty=%H%n%h%n%s%n%an"],
      {
        cwd: projectPath,
        encoding: "utf8",
      },
    );

    if (result.status !== 0 || !result.stdout?.trim()) {
      return null;
    }

    const [hash = "", shortHash = "", subject = "", author = ""] =
      result.stdout.trim().split("\n");

    if (!hash) {
      return null;
    }

    return {
      hash,
      shortHash,
      subject,
      author,
    };
  }

  private getPipelineKey(customerId: number, projectName: string) {
    return `${customerId}:${projectName}`;
  }

  private startPipeline(lockKey: string, action: string) {
    if (this.activePipelines.has(lockKey)) {
      throw new BadRequestException(
        `${action} is already running for this project. Please wait for it to finish.`,
      );
    }

    this.activePipelines.add(lockKey);
  }

  private releasePipeline(lockKey: string) {
    this.activePipelines.delete(lockKey);
  }
}
