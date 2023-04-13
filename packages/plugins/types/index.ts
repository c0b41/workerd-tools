export interface CacheOptions {
  name: string
  cache_id: string
  API: {
    base: string
    path?: string
    token?: string
  }
}

export interface KvOptions {
  name: string
  kv_id: string
  API: {
    base: string
    path?: string
    token?: string
  }
}

export interface DevOptions {
  autoReload: boolean
}

export interface ServiceDatabase {
  name: string
  id: string
}

export interface ServiceAnalytics {
  name: string
  id: string
}
