export type DeployStatus = "success" | "deploying" | "failed" | "pending";

export interface Deployment {
  id: number;
  name: string;
  description: string;
  framework: string;
  branch: string;
  environment: string;
  domain: string;
  commit: string;
  lastDeploy: string;
  buildTime: string;
  status: DeployStatus;
  icon: string;
  nodeVersion?: string | null;
  phpVersion?: string | null;
}
