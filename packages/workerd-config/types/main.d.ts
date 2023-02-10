export interface LoopBackOptions {
  address: String
  path?: String
}

export interface WorkerdConfigOptions {
  loopback?: LoopBackOptions
}

export interface ServiceModules {
  name: String
  esModule?: String
  commonJs?: String
}

// TODO: WASM, TEXT, JSON, DATA, https://github.com/cloudflare/workerd/blob/main/src/workerd/server/server-test.c%2B%2B#L526

export type ServiceBindingCrypto = {
  name: String
  cryptoKey: {
    raw?: String
    hex?: string
    base64?: String
    jwk?: String
    pkcs8?: String
    spki?: String
    algorithm?: {
      json: JSON
    }
    usages?: string[]
    extractable: boolean
  }
}

export type ServiceBindingService = {
  name: String
  service?: String
  kvNamespace?: String
  r2Bucket?: String
}

export type ServiceBindingBasic = {
  name: String
  type: 'text' | 'json' | 'wasm' | 'data'
  value: any
}

export type ServiceBindings = ServiceBindingBasic | ServiceBindingCrypto | ServiceBindingService

// https://github.com/cloudflare/workerd/blob/main/src/workerd/server/server-test.c%2B%2B
// TODO: durable object namespace

export interface ServicedExternal {
  address: String
  http?: SocketHttp
  https?: SocketHttps
}

export interface ServiceDisk {
  writable?: boolean
  allowDotfiles?: boolean
  path: string
}

export interface ServicedNetWork {
  allow?: String[]
  deny?: String[]
}

export interface ServiceCache {
  id: String
}

export interface ServiceKv {
  name: String
  id: String
}

export interface ServicedWorker {
  compatibilityDate?: string
  compatibilityFlags?: string[]
  modules?: ServiceModules[]
  serviceWorkerScript?: String
  loop?: LoopServices
  bindings?: ServiceBindings[]
  cacheApiOutbound?: String
  globalOutbound?: string
}

export interface LoopServices {
  cache?: ServiceCache
  kv?: ServiceKv[]
}

export interface Service {
  name: string
  worker?: ServicedWorker
  network?: ServicedNetWork
  external?: ServicedExternal
  disk?: ServiceDisk
}

export interface Socket {
  name: String
  address: String
  https?: SocketHttps
  http?: SocketHttp
  service: string
}

export type SocketHttps = {
  [keypair: string]: {
    privateKey: String
    certificateChain: String
  }
}

export type SocketHttp = {
  style?: 'proxy' | 'host'
  injectRequestHeaders: HttpHeaderInjectOptions[]
  injectResponseHeaders: HttpHeaderInjectOptions[]
}

export type HttpHeaderInjectOptions = {
  name: string
  value: string
}

export interface toJson {
  services: Service[]
  sockets: Socket[]
  pre_services: Service[]
  dev_services: Service[]
}

export type LoopBackServiceType = 'kv' | 'cache'
