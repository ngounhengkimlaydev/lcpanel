import type { ImportProjectDto } from "../dto/import-project.dto";
import type { PullProjectDto } from "../dto/pull-project.dto";

export type GitProvider = "github" | "gitlab";
export type ProjectProvider = GitProvider | "manual";
export type BuildLogStatus = "running" | "success" | "failed" | "cancelled";
export type DeploymentHistoryStatus = BuildLogStatus;
export type DeploymentTrigger = "import" | "redeploy";
export type DeployTarget = "ssr" | "static";
export type DeployStage = "install" | "build" | "deploy";
export type RuntimeKind = "nuxt" | "next" | "node";

export interface BuildLogEntry {
  id: number;
  customerId: number;
  historyId: number | null;
  project: string;
  branch: string;
  status: BuildLogStatus;
  createdAt: Date;
  updatedAt: Date;
  currentStage: DeployStage | null;
  installTime: string;
  buildTime: string;
  deployTime: string;
  output: string[];
}

export interface GitCommitSnapshot {
  hash: string;
  shortHash: string;
  subject: string;
  author: string;
}

export interface RuntimeRegistration {
  kind: RuntimeKind;
  port: number;
  domain: string;
}

export interface DeploymentManifest {
  projectName: string;
  branch: string;
  domain: string;
  framework: string;
  rootDirectory: string;
  installCommand?: string | null;
  buildCommand?: string | null;
  outputDirectory?: string | null;
  pm2Name?: string | null;
  nodeVersion?: string | null;
  phpVersion?: string | null;
  target: DeployTarget;
  runtime?: RuntimeRegistration | null;
}

export interface RuntimeCommand {
  kind: RuntimeKind;
  command: string;
  args: string[];
  port: number;
  env: NodeJS.ProcessEnv;
}

export interface ImportPipelineInput {
  customerId: number;
  projectId: number;
  projectName: string;
  branch: string;
  cloneUrl: string;
  projectPath: string;
  buildPath: string;
  dto: ImportProjectDto;
  lockKey: string;
}

export interface PullPipelineInput {
  customerId: number;
  projectId: number;
  projectName: string;
  branch: string;
  projectPath: string;
  buildPath: string;
  dto: PullProjectDto;
  manifest: DeploymentManifest | null;
  lockKey: string;
}
