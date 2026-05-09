export interface ImportProjectInput {
  projectName: string;
  repoUrl: string;
  branch: string;
  installCommand?: string;
  buildCommand?: string;
}
