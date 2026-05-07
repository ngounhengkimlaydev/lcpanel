export type CronJobStatus = 'active' | 'paused' | 'failed'

export interface CronJob {
  id: number
  name: string
  command: string
  schedule: string
  user: string
  status: CronJobStatus
  last_run: string
  next_run: string
  created_at: string
}