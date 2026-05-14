export type HistoryStatus = "success" | "running" | "failed" | "cancelled"

export interface DeployHistory {
    id: number
    projectId: number
    project: string
    message: string
    branch: string
    commit: string
    status: HistoryStatus
    environment: string
    author: string
    deployedAt: string
    duration: string
    version: string
    domain: string
}
