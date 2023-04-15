import { Service, Socket } from '../src/lib/nodes'

export interface WorkerdConfigOptions {}

export type ModuleType = 'esModule' | 'commonJsModule' | 'text' | 'data' | 'wasm' | 'json'

export type IServiceModules = {
  name: string
  type: ModuleType
  path?: string
  content?: Uint8Array | string
}

export type ServiceBindingCrypto = {
  name?: string
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
  name?: string
  service?: string
  kvNamespace?: string
  r2Bucket?: string
  queue?: string
}

export type ServiceBindingBasic = {
  name?: string
  type?: 'text' | 'json' | 'wasm' | 'data'
  content?: string | Uint8Array
  path?: string
}

export type ServiceBindingDurableObjectNamespace = {
  name?: string
  durableObjectNamespace?: string
}

export type ServiceBindingWrapped = {
  name?: string
  wrapped?: {
    moduleName: string
    entrypoint?: string
    innerBindings: IServiceBindings[]
  }
}

export type IServiceBindings =
  | ServiceBindingBasic
  | ServiceBindingCrypto
  | ServiceBindingService
  | ServiceBindingDurableObjectNamespace
  | ServiceBindingWrapped

export interface IServiceExternal {
  address: string
  http?: ISocketHttp
  https?: ISocketHttps
}

export interface IServiceDisk {
  writable?: boolean
  allowDotfiles?: boolean
  path: string
}

export interface IServiceNetWork {
  allow?: string[]
  deny?: string[]
}

export interface IDurableObjectNamespace {
  className: string
  uniqueKey: string
}

export interface DurableObjectStorage {
  inMemory?: boolean
  localDisk?: string
}

export interface IServiceWorker {
  compatibilityDate?: string
  compatibilityFlags?: string[]
  modules?: IServiceModules[]
  serviceWorkerScript?: {
    path?: string
    content?: Uint8Array | string
  }
  bindings?: IServiceBindings[]
  durableObjectNamespaces?: IDurableObjectNamespace[]
  durableObjectStorage?: DurableObjectStorage
  durableObjectUniqueKeyModifier?: string
  cacheApiOutbound?: string
  globalOutbound?: string
  plugins?: WorkerPlugin[]
}

export interface WorkerPlugin {
  (options: any, service: Service): Service
}

export interface IService {
  name: string
  worker?: IServiceWorker
  network?: IServiceNetWork
  external?: IServiceExternal
  disk?: IServiceDisk
}

export interface ISocket {
  name: string
  address: string
  https?: ISocketHttps
  http?: ISocketHttp
  service?: {
    name?: string
    entrypoint?: string
  }
}

export type ISocketHttps = {
  [keypair: string]: {
    privateKey: {
      path?: string
      content?: Uint8Array | string
    }
    certificateChain: {
      path?: string
      content?: Uint8Array | string
    }
  }
}

export type ISocketHttp = {
  style?: 'proxy' | 'host'
  injectRequestHeaders: IHttpHeaderInjectOptions[]
  injectResponseHeaders: IHttpHeaderInjectOptions[]
}

export type IHttpHeaderInjectOptions = {
  name: string
  value: string
}

export type IExtensionModule = {
  name: string
  internal?: boolean
  path?: string
  content?: Uint8Array | string
}

export interface IExtension {
  modules?: IExtensionModule[]
}

export interface toJson {
  extensions: IExtension
  services: Service[]
  sockets: Socket[]
  pre_services: Service[]
  dev_services: Service[]
}
