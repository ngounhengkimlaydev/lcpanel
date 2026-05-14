export type BuildStatus = "success" | "running" | "failed" | "cancelled"

export interface BuildLog {
    id: number
    project: string
    branch: string
    commit: string
    status: BuildStatus
    duration: string
    createdAt: string
    installTime: string
    buildTime: string
    deployTime: string
    output: string
    packagePlan: string
    nodeVersion: string
    phpVersion: string
    domain: string | null
}
