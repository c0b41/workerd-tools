import { RequestGenericInterface, RouteHandler } from 'fastify'

type kvPluginOptions = {
  path?: string | undefined
  gateway?: Function | null
}

type cachePluginOptions = {
  path?: string | undefined
  gateway?: Function | null
}

type d1PluginOptions = {
  path?: string | undefined
  gateway?: Function | null
}

interface KvServiceRoutes {
  listKv: RouteHandler
  getKv: RouteHandler
  putKv: RouteHandler
  deleteKv: RouteHandler
}

interface CacheServiceRoutes {
  getCache: RouteHandler
  putCache: RouteHandler
  deleteCache: RouteHandler
}

interface D1ServiceRoutes {
  getDump: RouteHandler
  getQuery: RouteHandler
  getExecute: RouteHandler
}

interface requestKvParams {
  ns: string
  key: string
}
