import { Extension, Service, Socket } from '../src/lib/nodes'
import { WorkerdConfig } from '../src'

export type WorkerdConfigOptions = {
  v8Flags?: string[]
  autoGates?: string[]
}

// Https Options
export type IHttpsOptions = {
  options: IHttpOptions
  tlsOptions: ITlsOptions
}

export type ITcpOptions = {
  tlsOptions: ITlsOptions
}

// Tls Options
export type ITlsOptions = {
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
  trustedCertificates: string[]
  cipherList?: string
  minVersion?: TlsOptionsVersion
}

// Tls Option version
export declare enum TlsOptionsVersion {
  GOOD_DEFAULT = 0,
  SSL3 = 1,
  TLS1DOT0 = 2,
  TLS1DOT1 = 3,
  TLS1DOT2 = 4,
  TLS1DOT3 = 5,
}

// Http options
export type IHttpOptions = {
  style?: IHttpStyles
  injectRequestHeaders: IHttpHeaderInjectOptions[]
  injectResponseHeaders: IHttpHeaderInjectOptions[]
}

export enum IHttpStyles {
  HOST = 0,
  PROXY = 1,
}

export type IHttpHeaderInjectOptions = {
  name: string
  value: string
}

// Module types & Modules
export type ModuleType = 'esModule' | 'commonJsModule' | 'text' | 'data' | 'wasm' | 'json' | 'nodeJsCompatModule' | 'pythonModule' | 'pythonRequirement'

export type IServiceModules = {
  name: string
  type: ModuleType
  path?: string
  content?: string
}

// Bindings
export type IServiceBindings =
  | ServiceBindingBasic
  | ServiceBindingCrypto
  | ServiceBindingService
  | ServiceBindingDurableObjectNamespace
  | ServiceBindingWrapped
  | ServiceBindingUnsafeEval
  | ServiceBindingHyperDrive

export type ServiceBindingService = {
  name?: string
  service?: string
  kvNamespace?: string
  r2Bucket?: string
  r2Admin?: string
  queue?: string
  fromEnvironment?: string
  analyticsEngine?: string
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

export type ServiceBindingUnsafeEval = {
  name?: string
  unsafeEval?: boolean
}

export type ServiceBindingHyperDrive = {
  name?: string
  hyperDrive?: {
    designator: string // this can be name
    database: string
    user: string
    password: string
    scheme: string
  }
}

export enum ICryptoUsage {
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
    usages?: ICryptoUsage[]
    extractable: boolean
  }
}

// Service External
export interface IServiceExternal {
  address: string
  http?: IHttpOptions
  https?: IHttpsOptions
  tcp?: ITcpOptions
}

// Service Disk
export interface IServiceDisk {
  writable?: boolean
  allowDotfiles?: boolean
  path: string
}

// Service Network
export interface IServiceNetWork {
  allow?: string[]
  deny?: string[]
  tlsOptions: ITlsOptions
}

// Service Worker
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
  durableObjectStorage?: IDurableObjectStorage
  durableObjectUniqueKeyModifier?: string
  cacheApiOutbound?: string
  globalOutbound?: string
  plugins?: WorkerPlugin[]
}

export interface IDurableObjectNamespace {
  className: string
  uniqueKey: string
}

export interface IDurableObjectStorage {
  inMemory?: boolean
  localDisk?: string
}

// Service
export interface IService {
  name: string
  worker?: IServiceWorker
  network?: IServiceNetWork
  external?: IServiceExternal
  disk?: IServiceDisk
}

// Socket
export interface ISocket {
  name: string
  address: string
  https?: IHttpsOptions
  http?: IHttpOptions
  service?: {
    name?: string
    entrypoint?: string
  }
}

// workerd-config plugin func
export interface WorkerPlugin {
  (options: any): WorkerPluginCall
}

export interface WorkerPluginCall {
  (instance: WorkerdConfig, service: Service): Promise<void>
}

// Extension
export interface IExtension {
  modules?: IExtensionModule[]
}

export type IExtensionModule = {
  name: string
  internal?: boolean
  path?: string
  content?: string
}

// Output schema
export interface toJson {
  options: WorkerdConfigOptions
  extensions: Extension[]
  services: Service[]
  sockets: Socket[]
}
