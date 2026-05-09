export type BlockedIpStatus = 'active' | 'expired' | 'whitelisted'
export type BlockedIpType = 'manual' | 'auto' | 'firewall'
export type BlockedIpScope = 'global' | 'ssh' | 'http' | 'mail' | 'database'

export type BlockedIp = {
  id: number
  ip: string
  reason: string
  country: string
  attempts: number
  type: BlockedIpType
  scope: BlockedIpScope
  status: BlockedIpStatus
  blockedAt: string
  expiresAt: string | null
}

export type BlockedIpForm = {
  ip: string
  reason: string
  country: string
  attempts: number
  type: BlockedIpType
  scope: BlockedIpScope
  status: BlockedIpStatus
  expiresAt: string
}