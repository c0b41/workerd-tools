import {
  IHttpHeaderInjectOptions,
  IDurableObjectNamespace,
  IExtension,
  IService,
  IServiceModules,
  WorkerdConfigOptions,
  IServiceBindings,
  ISocket,
  IExtensionModule,
} from '@types'
import { createBinding } from '@utils'
import {
  WorkerConfigModule,
  ExtensionModule,
  Http,
  Https,
  Network,
  External,
  Worker,
  Disk,
  ServiceModule,
  Service,
  Socket,
  SocketService,
  WorkerModule,
  DurableObjectNamespace,
  DurableObjectStorage,
  Extension,
  Keypair,
  Plugin,
} from '@nodes'

class WorkerdConfig extends WorkerConfigModule {
  private options: WorkerdConfigOptions | null = {}
  constructor(options?: WorkerdConfigOptions) {
    super()
    this.options = options
  }

  Service(input: IService) {
    let service = new Service()

    if (input.name) {
      service.setName(input.name)
    }

    if (input.network) {
      let network = new Network()

      if (input.network.allow) {
        input.network.allow.forEach((ip: string) => {
          network.setAllow(ip)
        })
      }

      if (input.network.deny) {
        input.network.deny.forEach((ip: string) => {
          network.setDeny(ip)
        })
      }

      service.setNetwork(network)
    }

    if (input.external) {
      let external = new External()

      if (input.external.address) {
        external.setAddress(input.external.address)
      }

      if (input.external.http) {
        let http = new Http()

        if (input.external.http.style) {
          http.setStyle(input.external.http.style)
        }

        if (input.external.http.injectRequestHeaders) {
          input.external.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions) => {
            http.setInjectRequestHeaders(header)
          })
        }

        if (input.external.http.injectResponseHeaders) {
          input.external.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions) => {
            http.setInjectResponseHeaders(header)
          })
        }

        external.setHttp(http)
      }

      if (input.external.https) {
        let https = new Https()

        if (input.external.https.keypair) {
          let keypair = new Keypair()
          if (input.external.https.keypair.privateKey) {
            let module = new ServiceModule()

            if (input.external.https.keypair.privateKey.path) {
              module.setPath(input.external.https.keypair.privateKey.path)
            }

            if (input.external.https.keypair.privateKey.content) {
              module.setContent(input.external.https.keypair.privateKey.content)
            }

            keypair.setPrivateKey(module)
          }

          if (input.external.https.keypair.certificateChain) {
            let module = new ServiceModule()

            if (input.external.https.keypair.certificateChain.path) {
              module.setPath(input.external.https.keypair.certificateChain.path)
            }

            if (input.external.https.keypair.certificateChain.content) {
              module.setContent(input.external.https.keypair.certificateChain.content)
            }

            keypair.setCertificateChain(module)
          }

          https.setKeypair(keypair)
        }

        if (input.external.https.requireClientCerts) {
          https.setRequireClientCerts(input.external.https.requireClientCerts)
        }

        if (input.external.https.trustBrowserCas) {
          https.setTrustBrowserCas(input.external.https.trustBrowserCas)
        }

        if (input.external.https.minVersion) {
          https.setMinVersion(input.external.https.minVersion)
        }

        external.setHttps(https)
      }

      service.setExternal(external)
    }

    if (input.disk) {
      let disk = new Disk()
      if (input.disk.writable) {
        disk.setWritable(input.disk.writable)
      }

      if (input.disk.allowDotfiles) {
        disk.setAllowDotfiles(input.disk.allowDotfiles)
      }

      if (input.disk.path) {
        disk.setPath(input.disk.path)
      }

      service.setDisk(disk)
    }

    if (input.worker) {
      let worker = new Worker()

      if (input.worker.compatibilityDate) {
        worker.setcompatibilityDate(input.worker.compatibilityDate)
      }

      if (input.worker.compatibilityFlags) {
        input.worker.compatibilityFlags.forEach((flag: string) => {
          worker.setcompatibilityFlags(flag)
        })
      }

      if (input.worker.cacheApiOutbound) {
        worker.setCacheApiOutbound(input.worker.cacheApiOutbound)
      }

      if (input.worker.globalOutbound) {
        worker.setGlobalOutbound(input.worker.globalOutbound)
      }

      if (input.worker.durableObjectUniqueKeyModifier) {
        worker.setDurableObjectUniqueKeyModifier(input.worker.durableObjectUniqueKeyModifier)
      }

      if (input.worker.durableObjectNamespaces) {
        input.worker.durableObjectNamespaces.forEach((item: IDurableObjectNamespace) => {
          let durable_object_namespace = new DurableObjectNamespace()

          if (item.className) {
            durable_object_namespace.setClassName(item.className)
          }

          if (item.uniqueKey) {
            durable_object_namespace.setUniqueKey(item.uniqueKey)
          }

          worker.setDurableObjectNamespaces(durable_object_namespace)
        })
      }

      if (input.worker.durableObjectStorage) {
        let durable_object_storage = new DurableObjectStorage()

        if (input.worker.durableObjectStorage.inMemory) {
          durable_object_storage.setInMemory(input.worker.durableObjectStorage.inMemory)
        }

        if (input.worker.durableObjectStorage.localDisk) {
          durable_object_storage.setLocalDisk(input.worker.durableObjectStorage.localDisk)
        }

        worker.setDurableObjectStorage(durable_object_storage)
      }

      if (input.worker.serviceWorkerScript) {
        let module = new ServiceModule()

        if (input.worker.serviceWorkerScript.path) {
          module.setPath(input.worker.serviceWorkerScript.path)
        }

        if (input.worker.serviceWorkerScript.content) {
          module.setContent(input.worker.serviceWorkerScript.content)
        }

        worker.setServiceWorkerScript(module)
      }

      if (input.worker.modules) {
        input.worker.modules.forEach((module: IServiceModules) => {
          let worker_module = new WorkerModule()

          if (module.name) {
            worker_module.setName(module.name)
          }

          if (module.path) {
            worker_module.setPath(module.path)
          }

          if (module.type) {
            worker_module.setType(module.type)
          }

          if (module.content) {
            worker_module.setContent(module.content)
          }

          worker.setModules(worker_module)
        })
      }

      if (input.worker.bindings) {
        input.worker.bindings.forEach((binding: IServiceBindings) => {
          let worker_binding = createBinding(binding)
          worker.setBindings(worker_binding)
        })
      }

      service.setWorker(worker)
    }

    if (input.worker?.plugins && input.worker.plugins.length > 0) {
      for (const plugin of input.worker.plugins) {
        let _plugin = new Plugin()
        _plugin.setName(service.name)
        _plugin.setCall(plugin)
        service.worker.setPlugins(_plugin)
      }
    }

    this.services.add(service)
    return this
  }

  Extension(input: IExtension) {
    let extension = new Extension()

    input.modules.forEach((module: IExtensionModule) => {
      let extensionModule = new ExtensionModule()

      if (module.name) {
        extensionModule.setName(module.name)
      }

      if (module.internal) {
        extensionModule.setInternal(module.internal)
      }

      if (module.path) {
        extensionModule.setPath(module.path)
      }

      if (module.content) {
        extensionModule.setContent(module.content)
      }
      extension.setModules(extensionModule)
    })

    this.extensions.add(extension)
    return this
  }

  Socket(input: ISocket) {
    let socket = new Socket()

    if (input.name) {
      socket.setName(input.name)
    }

    if (input.address) {
      socket.setAddress(input.address)
    }

    if (input.http) {
      let http = new Http()

      if (input.http.style) {
        http.setStyle(input.http.style)
      }

      if (input.http.injectRequestHeaders) {
        input.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions) => {
          http.setInjectRequestHeaders(header)
        })
      }

      if (input.http.injectResponseHeaders) {
        input.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions) => {
          http.setInjectResponseHeaders(header)
        })
      }

      socket.setHttp(http)
    }

    if (input.https) {
      let https = new Https()

      if (input.https.keypair) {
        let keypair = new Keypair()
        if (input.https.keypair.privateKey) {
          let module = new ServiceModule()

          if (input.https.keypair.privateKey.path) {
            module.setPath(https.keypair.privateKey.path)
          }

          if (input.https.keypair.privateKey.content) {
            module.setContent(https.keypair.privateKey.content)
          }

          keypair.setPrivateKey(module)
        }

        if (input.https.keypair.certificateChain) {
          let module = new ServiceModule()

          if (input.https.keypair.certificateChain.path) {
            module.setPath(input.https.keypair.certificateChain.path)
          }

          if (input.https.keypair.certificateChain.content) {
            module.setContent(input.https.keypair.certificateChain.content)
          }

          keypair.setCertificateChain(module)
        }

        https.setKeypair(keypair)
      }

      if (input.https.requireClientCerts) {
        https.setRequireClientCerts(input.https.requireClientCerts)
      }

      if (input.https.trustBrowserCas) {
        https.setTrustBrowserCas(input.https.trustBrowserCas)
      }

      if (input.https.minVersion) {
        https.setMinVersion(input.https.minVersion)
      }

      socket.setHttps(https)
    }

    if (input.service) {
      let service = new SocketService()

      if (input.service.name) {
        service.setName(input.service.name)
      }

      if (input.service.entrypoint) {
        service.setEntrypoint(input.service.entrypoint)
      }

      socket.setService(service)
    }

    this.sockets.add(socket)
    return this
  }
}

export default WorkerdConfig
