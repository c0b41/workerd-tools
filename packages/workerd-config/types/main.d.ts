interface LoopBackOptions {
  address: String
  path?: String
}

interface WorkerdConfigOptions {
  loopback: LoopBackOptions | null
  prettyErrors?: boolean
  autoReload?: boolean
}

interface ServiceModules {
  name: String
  esModule?: String
  commonJs?: String
}

// TODO: WASM, TEXT, JSON, DATA, https://github.com/cloudflare/workerd/blob/main/src/workerd/server/server-test.c%2B%2B#L526

type ServiceBindingCrypto = {
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

type ServiceBindingService = {
  name: String
  service?: String
  kvNamespace?: String
  r2Bucket?: String
}

type ServiceBindingBasic = {
  name: String
  type: 'text' | 'json' | 'wasm' | 'data'
  value: any
}

type ServiceBindings = ServiceBindingBasic | ServiceBindingCrypto | ServiceBindingService

// https://github.com/cloudflare/workerd/blob/main/src/workerd/server/server-test.c%2B%2B
// TODO: durable object namespace

interface ServicedExternal {
  address: String
}

interface ServicedNetWork {
  allow?: String[]
  deny?: String[]
}

interface ServiceCache {
  id: String
}

interface ServiceKv {
  name: String
  id: String
}

interface ServicedWorker {
  compatibilityDate?: string
  compatibilityFlags?: string[]
  modules?: ServiceModules[]
  serviceWorkerScript?: String
  loop?: LoopServices
  bindings?: ServiceBindings[]
  cacheApiOutbound?: String
  globalOutbound?: string
}

interface LoopServices {
  cache?: ServiceCache
  kv?: ServiceKv[]
}

interface Service {
  name: string
  worker?: ServicedWorker
  network?: ServicedNetWork
  external?: ServicedExternal
}

interface Socket {
  name: String
  address: String
  https: {
    [keypair: string]: {
      privateKey: String
      certificateChain: String
    }
  }
  service: string
}

interface toJson {
  services: Service[]
  sockets: Socket[]
  pre_services: Service[]
  dev_services: Service[]
}

type LoopBackServiceType = 'kv' | 'cache'
