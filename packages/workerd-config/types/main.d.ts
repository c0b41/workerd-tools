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
  esModule?: boolean
  embed: String
}

interface ServiceBindings {
  name: String
  type: String
  value: any
}

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
  cache?: ServiceCache
  kv?: ServiceKv[]
  bindings?: ServiceBindings[]
  cacheApiOutbound?: String
  globalOutbound?: string
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
}

type LoopBackServiceType = 'kv' | 'cache'
