export const KV_PLUGIN_NAME: string = 'kv'

export const MIN_CACHE_TTL: number = 60 /* 60s */
export const MAX_LIST_KEYS: number = 1000
export const MAX_KEY_SIZE: number = 512 /* 512B */
export const MAX_VALUE_SIZE: number = 25 * 1024 * 1024 /* 25MiB */
export const MAX_METADATA_SIZE: number = 1024 /* 1KiB */

export const PARAM_URL_ENCODED: string = 'urlencoded'
export const PARAM_CACHE_TTL: string = 'cache_ttl'
export const PARAM_EXPIRATION: string = 'expiration'
export const PARAM_EXPIRATION_TTL: string = 'expiration_ttl'
export const PARAM_LIST_LIMIT: string = 'key_count_limit'
export const PARAM_LIST_PREFIX: string = 'prefix'
export const PARAM_LIST_CURSOR: string = 'cursor'

export const HEADER_EXPIRATION: string = 'CF-Expiration'
export const HEADER_METADATA: string = 'CF-KV-Metadata'
export const HEADER_SITES: string = 'MF-Sites'
