// src/modules/deployments/deployments.repository.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";


export type GitProvider = "github" | "gitlab";

type UpsertGitConnectionData = {
  provider: GitProvider;
  providerUserId: string;
  username?: string | null;
  avatarUrl?: string | null;
  accessToken: string;
  refreshToken?: string | null;
  scope?: string | null;
  expiresAt?: Date | null;
};

type CreateGitProjectData = {
  provider: GitProvider | "manual";
  providerRepoId: string;
  connectionId?: number | null;
  name: string;
  fullName: string;
  cloneUrl: string;
  sshUrl?: string | null;
  htmlUrl?: string | null;
  defaultBranch?: string | null;
  localPath?: string | null;
  status?: string;
};

type UpdateGitProjectData = {
  localPath?: string | null;
  status?: string;
  lastPulledAt?: Date | null;
  defaultBranch?: string | null;
};

@Injectable()
export class DeploymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertGitConnection(customerId: number, data: UpsertGitConnectionData) {
    return this.prisma.gitConnection.upsert({
      where: {
        customer_id_provider: {
          customer_id: customerId,
          provider: data.provider,
        },
      },
      update: {
        provider_user_id: data.providerUserId,
        username: data.username ?? null,
        avatar_url: data.avatarUrl ?? null,
        access_token: data.accessToken,
        refresh_token: data.refreshToken ?? null,
        scope: data.scope ?? null,
        expires_at: data.expiresAt ?? null,
      },
      create: {
        customer_id: customerId,
        provider: data.provider,
        provider_user_id: data.providerUserId,
        username: data.username ?? null,
        avatar_url: data.avatarUrl ?? null,
        access_token: data.accessToken,
        refresh_token: data.refreshToken ?? null,
        scope: data.scope ?? null,
        expires_at: data.expiresAt ?? null,
      },
    });
  }

  async findGitConnection(customerId: number, provider: GitProvider) {
    return this.prisma.gitConnection.findUnique({
      where: {
        customer_id_provider: {
          customer_id: customerId,
          provider,
        },
      },
    });
  }

  async findGitConnectionOrThrow(customerId: number, provider: GitProvider) {
    const connection = await this.findGitConnection(customerId, provider);

    if (!connection) {
      throw new NotFoundException(`${provider} is not connected`);
    }

    return connection;
  }

  async getGitConnections(customerId: number) {
    return this.prisma.gitConnection.findMany({
      where: {
        customer_id: customerId,
      },
      orderBy: {
        updated_at: "desc",
      },
    });
  }

  async disconnectGitConnection(customerId: number, provider: GitProvider) {
    return this.prisma.gitConnection.delete({
      where: {
        customer_id_provider: {
          customer_id: customerId,
          provider,
        },
      },
    });
  }

  async upsertGitProject(customerId: number, data: CreateGitProjectData) {
    return this.prisma.gitProject.upsert({
      where: {
        customer_id_provider_provider_repo_id: {
          customer_id: customerId,
          provider: data.provider,
          provider_repo_id: data.providerRepoId,
        },
      },
      update: {
        connection_id: data.connectionId ?? null,
        name: data.name,
        full_name: data.fullName,
        clone_url: data.cloneUrl,
        ssh_url: data.sshUrl ?? null,
        html_url: data.htmlUrl ?? null,
        default_branch: data.defaultBranch ?? null,
        local_path: data.localPath ?? null,
        status: data.status ?? "imported",
      },
      create: {
        customer_id: customerId,
        connection_id: data.connectionId ?? null,
        provider: data.provider,
        provider_repo_id: data.providerRepoId,
        name: data.name,
        full_name: data.fullName,
        clone_url: data.cloneUrl,
        ssh_url: data.sshUrl ?? null,
        html_url: data.htmlUrl ?? null,
        default_branch: data.defaultBranch ?? null,
        local_path: data.localPath ?? null,
        status: data.status ?? "imported",
      },
    });
  }

  async createManualGitProject(customerId: number, data: CreateGitProjectData) {
    return this.prisma.gitProject.create({
      data: {
        customer_id: customerId,
        connection_id: null,
        provider: "manual",
        provider_repo_id: data.providerRepoId,
        name: data.name,
        full_name: data.fullName,
        clone_url: data.cloneUrl,
        ssh_url: data.sshUrl ?? null,
        html_url: data.htmlUrl ?? null,
        default_branch: data.defaultBranch ?? null,
        local_path: data.localPath ?? null,
        status: data.status ?? "imported",
      },
    });
  }

  async getGitProjects(customerId: number) {
    return this.prisma.gitProject.findMany({
      where: {
        customer_id: customerId,
      },
      include: {
        connection: true,
      },
      orderBy: {
        updated_at: "desc",
      },
    });
  }

  async findGitProjectById(customerId: number, id: number) {
    return this.prisma.gitProject.findFirst({
      where: {
        id,
        customer_id: customerId,
      },
      include: {
        connection: true,
      },
    });
  }

  async findGitProjectByIdOrThrow(customerId: number, id: number) {
    const project = await this.findGitProjectById(customerId, id);

    if (!project) {
      throw new NotFoundException("Imported project not found");
    }

    return project;
  }

  async updateGitProject(
    customerId: number,
    id: number,
    data: UpdateGitProjectData,
  ) {
    await this.findGitProjectByIdOrThrow(customerId, id);

    return this.prisma.gitProject.update({
      where: {
        id,
      },
      data: {
        local_path: data.localPath,
        status: data.status,
        last_pulled_at: data.lastPulledAt,
        default_branch: data.defaultBranch,
      },
    });
  }

  async markGitProjectPulled(customerId: number, id: number) {
    await this.findGitProjectByIdOrThrow(customerId, id);

    return this.prisma.gitProject.update({
      where: {
        id,
      },
      data: {
        status: "pulled",
        last_pulled_at: new Date(),
      },
    });
  }

  async deleteGitProject(customerId: number, id: number) {
    await this.findGitProjectByIdOrThrow(customerId, id);

    return this.prisma.gitProject.delete({
      where: {
        id,
      },
    });
  }
}
