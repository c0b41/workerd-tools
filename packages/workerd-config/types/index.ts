export interface LoopBackOptions {
  address: string
  path?: string
}

export interface WorkerdConfigOptions {
  loopback?: LoopBackOptions
}

export type ServiceModules =
  | { name: string; esModule?: string }
  | { name: string; commonJsModule?: string }
  | { name: string; text?: string }
  | { name: string; data?: Uint8Array }
  | { name: string; wasm?: Uint8Array }
  | { name: string; json?: string }

export type ServiceBindingCrypto = {
  name: string
  cryptoKey: {
    raw?: string
    hex?: string
    base64?: string
    jwk?: string
    pkcs8?: string
    spki?: string
    algorithm?: {
      json: JSON
    }
    usages?: string[]
    extractable: boolean
  }
}

export type ServiceBindingService = {
  name: string
  service?: string
  kvNamespace?: string
  r2Bucket?: string
}

export type ServiceBindingBasic = {
  name: string
  type: 'text' | 'json' | 'wasm' | 'data'
  value: any
}

export type ServiceBindings = ServiceBindingBasic | ServiceBindingCrypto | ServiceBindingService

// https://github.com/cloudflare/workerd/blob/main/src/workerd/server/server-test.c%2B%2B
// TODO: durable object namespace

export interface ServicedExternal {
  address: string
  http?: SocketHttp
  https?: SocketHttps
}

export interface ServiceDisk {
  writable?: boolean
  allowDotfiles?: boolean
  path: string
}

export interface ServicedNetWork {
  allow?: string[]
  deny?: string[]
}

export interface ServiceCache {
  id: string
}

export interface ServiceKv {
  name: string
  id: string
}

export interface DurableObjectNamespace {
  className: string
  uniqueKey: string
}

export interface DurableObjectStorage {
  inMemory?: boolean
  localDisk?: string
}

export interface ServicedWorker {
  compatibilityDate?: string
  compatibilityFlags?: string[]
  modules?: ServiceModules[]
  serviceWorkerScript?: string
  loop?: LoopServices
  bindings?: ServiceBindings[]
  durableObjectNamespaces?: DurableObjectNamespace[]
  durableObjectStorage?: DurableObjectStorage
  cacheApiOutbound?: string
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
  name: string
  address: string
  https?: SocketHttps
  http?: SocketHttp
  service: string
}

export type SocketHttps = {
  [keypair: string]: {
    privateKey: string
    certificateChain: string
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
