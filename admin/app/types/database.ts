export type DatabaseStatus = 'active' | 'suspended' | 'error'
export type DatabaseEngine = 'mysql' | 'mariadb' | 'postgresql'

export type DatabaseItem = {
  id: number
  name: string
  username: string
  engine: DatabaseEngine
  size: string
  tables: number
  status: DatabaseStatus
  host: string
  createdAt: string
  lastBackupAt: string | null
}

export type DatabaseCreateForm = {
  database_name: string
  username: string
  password: string
}