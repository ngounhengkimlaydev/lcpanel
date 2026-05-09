import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join, resolve } from "path";
import { PullProjectDto } from "./dto/pull-project.dto";
import { ImportProjectDto } from "./dto/import-project.dto";
import { DeploymentsRepository } from "./deployments.repository";

type GitProvider = "github" | "gitlab";
type ProjectProvider = "github" | "gitlab" | "manual";

@Injectable()
export class DeployService {
  private readonly appsPath: string;

  constructor(
    private readonly config: ConfigService,
    private readonly repository: DeploymentsRepository,
  ) {
    this.appsPath = this.config.get<string>("LCPANEL_APPS_PATH") || "";

    mkdirSync(this.appsPath, { recursive: true });
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
    const projects = await this.repository.getGitProjects(customerId);
    const deployments = projects.map((project) =>
      this.toDeploymentItem(project),
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
            deployments.filter((item) => item.status === "success").length,
          ),
          icon: "i-lucide-circle-check",
        },
        {
          label: "Deploying",
          value: String(
            deployments.filter((item) => item.status === "deploying").length,
          ),
          icon: "i-lucide-loader",
        },
        {
          label: "Failed",
          value: String(
            deployments.filter((item) => item.status === "failed").length,
          ),
          icon: "i-lucide-circle-x",
        },
      ],
      total: deployments.length,
    };
  }

  async getDeploymentHistory(customerId: number) {
    const projects = await this.repository.getGitProjects(customerId);
    const history = projects.map((project) => this.toHistoryItem(project));

    return {
      data: history,
      total: history.length,
    };
  }

  async getBuildLogs(customerId: number) {
    const projects = await this.repository.getGitProjects(customerId);
    const logs = projects.map((project) => this.toBuildLogItem(project));

    return {
      data: logs,
      total: logs.length,
    };
  }

  async importProject(customerId: number, dto: ImportProjectDto) {
    const projectName = this.safeProjectName(dto.projectName);
    const branch = this.safeBranchName(dto.branch);

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

    if (!existsSync(projectPath)) {
      await this.run("git", [
        "clone",
        "--branch",
        branch,
        "--depth",
        "1",
        cloneUrl,
        projectPath,
      ]);
    } else {
      if (!existsSync(join(projectPath, ".git"))) {
        throw new BadRequestException(
          "Project folder already exists but it is not a Git repository",
        );
      }

      await this.pullGitCode(projectPath, branch);
    }

    if (dto.installCommand) {
      await this.runCommandString(dto.installCommand, buildPath);
    }

    if (dto.buildCommand) {
      await this.runCommandString(dto.buildCommand, buildPath);
    }

    if (dto.pm2Name) {
      await this.restartPm2(dto.pm2Name);
    }

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
      status: "imported",
    });

    return {
      message: "Project imported successfully",
      data: project,
    };
  }

  async pullProject(customerId: number, id: number, dto: PullProjectDto) {
    const project = await this.repository.findGitProjectByIdOrThrow(
      customerId,
      id,
    );

    if (!project.local_path) {
      throw new NotFoundException("Project local path not found");
    }

    if (!existsSync(project.local_path)) {
      throw new NotFoundException("Project folder not found on server");
    }

    if (!existsSync(join(project.local_path, ".git"))) {
      throw new BadRequestException("Project folder is not a Git repository");
    }

    const rootDirectory = "./";
    const buildPath = this.safeJoin(project.local_path, rootDirectory);
    const branch = project.default_branch || "main";

    await this.pullGitCode(project.local_path, branch);

    /**
     * If you want install/build command from DB,
     * add those fields to GitProject table.
     */
    if (dto.install) {
      // await this.runCommandString(project.install_command, buildPath);
    }

    if (dto.build) {
      // await this.runCommandString(project.build_command, buildPath);
    }

    if (dto.restart) {
      // await this.restartPm2(project.pm2_name);
    }

    const updated = await this.repository.markGitProjectPulled(customerId, id);

    return {
      message: "Project pulled successfully",
      data: updated,
    };
  }

  async deleteProject(customerId: number, id: number) {
    const project = await this.repository.findGitProjectByIdOrThrow(
      customerId,
      id,
    );

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

  private async pullGitCode(projectPath: string, branch: string) {
    await this.run("git", ["fetch", "origin", branch], projectPath);
    await this.run("git", ["checkout", branch], projectPath);
    await this.run("git", ["reset", "--hard", `origin/${branch}`], projectPath);
  }

  private async restartPm2(pm2Name: string) {
    const safeName = this.safePm2Name(pm2Name);

    await this.run("pm2", ["restart", safeName, "--update-env"]);
  }

  private runCommandString(command: string, cwd: string) {
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

    return this.run(parsed.command, parsed.args, cwd);
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

  private run(command: string, args: string[], cwd?: string) {
    return new Promise<void>((resolvePromise, rejectPromise) => {
      const child = spawn(command, args, {
        cwd,
        shell: false,
        env: process.env,
      });

      let stderr = "";

      child.stdout.on("data", (data) => {
        console.log(`[${command}] ${data.toString()}`);
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
        console.error(`[${command}] ${data.toString()}`);
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

  private toDeploymentItem(project: any) {
    const status = this.toDeployStatus(project.status);
    const name = project.name || project.full_name || "Untitled project";
    const branch = project.default_branch || "main";

    return {
      id: project.id,
      name,
      description: project.full_name || project.clone_url || "Imported Git project",
      framework: this.detectFrameworkFromProject(project),
      branch,
      environment: "Production",
      domain: project.html_url || "-",
      commit: "-",
      lastDeploy: project.last_pulled_at
        ? project.last_pulled_at.toISOString()
        : project.updated_at?.toISOString?.() || "-",
      buildTime: status === "deploying" ? "Running" : "-",
      status,
      icon: this.getFrameworkIcon(this.detectFrameworkFromProject(project)),
      provider: project.provider,
      repoUrl: project.clone_url,
      localPath: project.local_path,
    };
  }

  private toHistoryItem(project: any) {
    const status = this.toHistoryStatus(project.status);
    const deployedAt = project.last_pulled_at || project.updated_at;

    return {
      id: project.id,
      project: project.name || project.full_name || "Untitled project",
      message: project.last_pulled_at
        ? "Pulled latest source code"
        : "Imported Git repository",
      branch: project.default_branch || "main",
      commit: "-",
      status,
      environment: "Production",
      author: project.connection?.username || project.provider || "Manual",
      deployedAt: deployedAt?.toISOString?.() || "-",
      duration: status === "running" ? "Running" : "-",
      version: `#${project.id}`,
      domain: project.html_url || "-",
    };
  }

  private toBuildLogItem(project: any) {
    const status = this.toHistoryStatus(project.status);
    const branch = project.default_branch || "main";
    const projectName = project.name || project.full_name || "Untitled project";

    return {
      id: project.id,
      project: projectName,
      branch,
      commit: "-",
      status,
      duration: status === "running" ? "Running" : "-",
      createdAt: project.updated_at?.toISOString?.() || "-",
      installTime: "-",
      buildTime: status === "running" ? "Running" : "-",
      deployTime: "-",
      output: this.buildLogOutput(projectName, branch, project.status),
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
    const name = `${project.name || ""} ${project.full_name || ""}`.toLowerCase();

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
    const lines = [
      `$ git fetch origin ${branch}`,
      `$ git checkout ${branch}`,
      `$ git reset --hard origin/${branch}`,
    ];

    if (status === "pulled") {
      lines.push("Source code pulled successfully.");
    } else if (status === "imported") {
      lines.push(`Project ${projectName} imported successfully.`);
    } else if (status === "failed") {
      lines.push("Deployment failed. Check server logs for the command error.");
    } else {
      lines.push("Waiting for deployment action.");
    }

    return lines.join("\n");
  }
}
