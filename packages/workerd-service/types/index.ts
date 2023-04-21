import { RequestGenericInterface, RouteHandler } from 'fastify'
import { Response } from 'undici'

export interface sqliteFunc {
  all: Function
  get: Function
  exec: Function
  run: Function
}

declare module 'fastify' {
  interface FastifyInstance {
    sqlite: sqliteFunc
  }
}

export type kvPluginOptions = {
  path: string | undefined
  //gateway?: Function | null
}

export type cachePluginOptions = {
  path: string | undefined
  //gateway: IECacheGateway
}

export type d1PluginOptions = {
  path?: string | undefined
  gateway?: Function | null
}

export interface KvServiceRoutes {
  listKv: RouteHandler
  getKv: RouteHandler
  putKv: RouteHandler
  deleteKv: RouteHandler
}

export interface CacheServiceRoutes {
  getCache: RouteHandler
  putCache: RouteHandler
  deleteCache: RouteHandler
}

export interface D1ServiceRoutes {
  getDump: RouteHandler
  getQuery: RouteHandler
  getExecute: RouteHandler
}

export interface requestKvParams {
  ns: string
  key: string
}

export interface StoredMeta<Meta = unknown> {
  /** Unix timestamp in seconds when this key expires */
  expiration?: number
  /** Arbitrary JSON-serializable object */
  metadata?: Meta
}

export interface IEBaseGateway {
  onReady(): Promise<void>
  onClose(): Promise<void>
}

export interface IECacheGateway extends IEBaseGateway {
  getCache(cacheID: string, namespace: string, key: string): Promise<Response>
  putCache(): Promise<Response>
  deleteCache(): Promise<Response>
}

export interface IEKvGateway extends IEBaseGateway {
  listKv(): Promise<Response>
  getKv(): Promise<Response>
  putKv(): Promise<Response>
  deleteKv(): Promise<Response>
}
