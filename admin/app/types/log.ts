export type LogLevel = 'info' | 'warning' | 'error' | 'success'

export interface ServerLog {
  id: number
  level: LogLevel
  source: string
  message: string
  ip: string
  user: string
  created_at: string
}