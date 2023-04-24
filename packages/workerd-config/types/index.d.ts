import { Extension, Service, Socket } from '@nodes'

export interface WorkerdConfigOptions {}

export type ModuleType = 'esModule' | 'commonJsModule' | 'text' | 'data' | 'wasm' | 'json'

export type IServiceModules = {
  name: string
  type: ModuleType
  path?: string
  content?: string
}

export enum IUsage {
  ENCRYPT = 0,
  DECRYPT = 1,
  SIGN = 2,
  VERIFY = 3,
  DERIVE_KEY = 4,
  DERIVE_BITS = 5,
  WRAP_KEY = 6,
  UNWRAP_KEY = 7,
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
      json: string
    }
    usages?: IUsage[]
    extractable: boolean
  }
}

export type ServiceBindingService = {
  name?: string
  service?: string
  kvNamespace?: string
  r2Bucket?: string
  r2Admin?: string
  queue?: string
}

export type ServiceBindingBasic = {
  name?: string
  type?: 'text' | 'json' | 'wasm' | 'data'
  content?: string
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
    content?: string
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

export declare enum TlsOptionsVersion {
  GOOD_DEFAULT = 0,
  SSL3 = 1,
  TLS1DOT0 = 2,
  TLS1DOT1 = 3,
  TLS1DOT2 = 4,
  TLS1DOT3 = 5,
}

export type ISocketHttps = {
  keypair: {
    privateKey: {
      path?: string
      content?: string
    }
    certificateChain: {
      path?: string
      content?: string
    }
  }
  requireClientCerts?: boolean
  trustBrowserCas?: boolean
  // Todo: trustedCertificates
  // todo: CipherList
  minVersion?: TlsOptionsVersion
}

export enum IHttpStyles {
  HOST = 0,
  PROXY = 1,
}

export type ISocketHttp = {
  style?: IHttpStyles
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
  content?: string
}

export interface IExtension {
  modules?: IExtensionModule[]
}

export interface toJson {
  extensions: IExtension[]
  services: Service[]
  sockets: Socket[]
  pre_services: Service[]
  dev_services: Service[]
}
