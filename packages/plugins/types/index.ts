export interface ServiceCache {
  id: string
}

export interface ServiceKv {
  name: string
  id: string
}

export interface ServiceDatabase {
  name: string
  id: string
}

export interface ServiceAnalytics {
  name: string
  id: string
}

export interface LoopServices {
  cache?: ServiceCache
  kv?: ServiceKv[]
  database: ServiceDatabase[]
  analytics: ServiceAnalytics[]
}

export type LoopBackServiceType = 'kv' | 'cache' | 'd1' | 'analytics' | 'dev'
