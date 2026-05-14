export type GitProviderKey = "github" | "gitlab" | "manual"

export interface GitProvider {
  key: GitProviderKey
  name: string
  icon: string
  description: string
  connected: boolean
  username?: string | null
  avatarUrl?: string | null
}

export interface GitRepository {
  id: number
  repositoryId: string
  provider: GitProviderKey
  name: string
  description: string
  branch: string
  framework: string
  repoUrl: string
  sshUrl?: string | null
  htmlUrl?: string | null
  private?: boolean
  updatedAt?: string
}

export interface GitImportForm {
  projectName: string
  repoUrl: string
  branch: string
  framework: string
  rootDirectory: string
  installCommand: string
  buildCommand: string
  outputDirectory: string
  nodeVersion: string
  phpVersion: string
}
