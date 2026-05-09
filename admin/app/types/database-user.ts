export type DatabaseUserStatus = 'active' | 'suspended' | 'locked'
export type DatabaseUserAuthType = 'password' | 'socket' | 'remote'

export type DatabasePrivilege =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'create'
  | 'drop'
  | 'index'
  | 'alter'

export type DatabaseUser = {
  id: number
  username: string
  host: string
  status: DatabaseUserStatus
  authType: DatabaseUserAuthType
  assignedDatabases: string[]
  privileges: DatabasePrivilege[]
  connections: number
  lastLoginAt: string | null
  createdAt: string
}

export type DatabaseUserForm = {
  username: string
  host: string
  password: string
  status: DatabaseUserStatus
  authType: DatabaseUserAuthType
  assignedDatabases: string
  privileges: DatabasePrivilege[]
}