import { default as WorkerdConfig } from '.'
import { Data, List, Message, Struct, Void } from 'capnp-ts'
import { IHttpHeaderInjectOptions, toJson } from '../../types'
import {
  Config as CapnpConfig,
  Extension as CapExtension,
  Extension_Module,
  Socket as CapSocket,
  Socket_Https,
  HttpOptions,
  ExternalServer,
  Service as CapService,
  Worker as CapWorker,
  Network as CapNetwork,
  ExternalServer_Https,
  ExternalServer_Tcp,
  TlsOptions,
  TlsOptions_Keypair,
  Worker_DurableObjectNamespace,
  Worker_Binding,
  DiskDirectory,
  HttpOptions_Header,
  ServiceDesignator,
  Worker_Module,
  Worker_DurableObjectStorage,
} from './config/workerd.capnp.js'
import { DurableObjectNamespace, Extension, ExtensionModule, Service, Socket, WorkerModule, Plugin } from './nodes'
import { createBinaryBinding } from './utils'

export default class WorkerdOutput {
  private config: WorkerdConfig | null
  private struct: CapnpConfig
  private out: Message
  constructor(config: WorkerdConfig) {
    this.config = config
    this.out = new Message()
    this.struct = this.out.initRoot(CapnpConfig)
  }

  private generateServices() {
    let services = [...this.config.services]
    let size = services.length ?? 0
    let structServices: List<CapService> = this.struct.initServices(size)

    services.forEach((service: Service, index: number) => {
      let structService: CapService = structServices.get(index)
      if (service.name) {
        structService.setName(service.name)
      }

      if (service.network) {
        let structServiceNetwork: CapNetwork = structService.initNetwork()

        if (service.network.allow) {
          let allowsize = service.network.allow.length ?? 0
          let structServiceNetworkAllow: List<string> = structServiceNetwork.initAllow(allowsize)

          service.network.allow.forEach((network: string, index: number) => {
            structServiceNetworkAllow.set(index, network)
          })
          structServiceNetwork.setAllow(structServiceNetworkAllow)
        }

        if (service.network.deny) {
          let denysize = service.network.deny.length ?? 0
          let structServiceNetworkDeny: List<string> = structServiceNetwork.initDeny(denysize)

          service.network.deny.forEach((network: string) => {
            structServiceNetworkDeny.set(index, network)
          })

          structServiceNetwork.setDeny(structServiceNetworkDeny)
        }
      }

      if (service.disk) {
        let structServiceDisk: DiskDirectory = structService.initDisk()
        if (service.disk.path) {
          structServiceDisk.setPath(service.disk.path)
        }
        if (service.disk.allowDotfiles) {
          structServiceDisk.setAllowDotfiles(service.disk.allowDotfiles)
        }
        if (service.disk.writable) {
          structServiceDisk.setWritable(service.disk.writable)
        }
        structService.setDisk(structServiceDisk)
      }

      if (service.external) {
        let structServiceExternal: ExternalServer = structService.initExternal()

        if (service.external.address) {
          structServiceExternal.setAddress(service.external.address)
        }

        if (service.external.http) {
          let structServiceExternalHttp: HttpOptions = structServiceExternal.initHttp()

          if (service.external.http.style) {
            structServiceExternalHttp.setStyle(service.external.http.style)
          }

          if (service.external.http.injectRequestHeaders && service.external.http.injectRequestHeaders.length > 0) {
            let size = service.external.http.injectRequestHeaders.length ?? 0
            let structServiceExternalHttpRequestHeaders: List<HttpOptions_Header> = structServiceExternalHttp.initInjectRequestHeaders(size)

            service.external.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions, index: number) => {
              let injectRequestHeader = structServiceExternalHttpRequestHeaders.get(index)
              injectRequestHeader.setName(header.name)
              injectRequestHeader.setValue(header.value)
            })

            structServiceExternalHttp.setInjectRequestHeaders(structServiceExternalHttpRequestHeaders)
          }

          if (service.external.http.injectResponseHeaders && service.external.http.injectResponseHeaders.length > 0) {
            let size = service.external.http.injectResponseHeaders.length ?? 0
            let structServiceExternalHttpResponseHeaders: List<HttpOptions_Header> = structServiceExternalHttp.initInjectResponseHeaders(size)

            service.external.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions, index: number) => {
              let injectResponseHeader = structServiceExternalHttpResponseHeaders.get(index)
              injectResponseHeader.setName(header.name)
              injectResponseHeader.setValue(header.value)
            })

            structServiceExternalHttp.setInjectResponseHeaders(structServiceExternalHttpResponseHeaders)
          }

          structServiceExternal.setHttp(structServiceExternalHttp)
        }

        if (service.external.https) {
          let structServiceExternalHttps: ExternalServer_Https = structServiceExternal.initHttps()

          //if (service.external.https.keypair) {
          //  let structSocketHttpsTls: TlsOptions = structServiceExternalHttps.initTlsOptions()
          //  let structSocketHttpsKeypair: TlsOptions_Keypair = structSocketHttpsTls.initKeypair()
          //
          //  if (service.external.https.keypair.privateKey.content) {
          //    structSocketHttpsKeypair.setPrivateKey(service.external.https.keypair.privateKey.content)
          //  }
          //
          //  if (service.external.https.keypair.certificateChain.content) {
          //    structSocketHttpsKeypair.setCertificateChain(service.external.https.keypair.certificateChain.content)
          //  }
          //
          //  structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
          //  structServiceExternalHttps.setTlsOptions(structSocketHttpsTls)
          //}
        }

        if (service.external.tcp) {
          let structServiceExternalTcp: ExternalServer_Tcp = structServiceExternal.initTcp()

          if (service.external.tcp.tlsOptions) {
            // let structSocketTcpTls: TlsOptions = structServiceExternalTcp.initTlsOptions()
          }

          if (service.external.tcp.certificateHost) {
            structServiceExternalTcp.setCertificateHost(service.external.tcp.certificateHost)
          }
        }
      }

      if (service.worker) {
        let structServiceWorker: CapWorker = structService.initWorker()

        if (service.worker.compatibilityDate) {
          structServiceWorker.setCompatibilityDate(service.worker.compatibilityDate)
        }

        if (service.worker.compatibilityFlags) {
          let flagsSize = service.worker.compatibilityFlags.length ?? 0
          let structServiceWorkerCompatibilityFlags: List<string> = structServiceWorker.initCompatibilityFlags(flagsSize)

          service.worker.compatibilityFlags.forEach((flag: string, index: number) => {
            structServiceWorkerCompatibilityFlags.set(index, flag)
          })
        }

        if (service.worker.cacheApiOutbound) {
          let structServiceWorkerCacheApiOut: ServiceDesignator = structServiceWorker.initCacheApiOutbound()
          structServiceWorkerCacheApiOut.setName(service.worker.cacheApiOutbound)
          structServiceWorker.setCacheApiOutbound(structServiceWorkerCacheApiOut)
        }

        if (service.worker.globalOutbound) {
          let structServiceWorkerGlobalOut: ServiceDesignator = structServiceWorker.initGlobalOutbound()
          structServiceWorkerGlobalOut.setName(service.worker.globalOutbound)
          structServiceWorker.setGlobalOutbound(structServiceWorkerGlobalOut)
        }

        if (service.worker.bindings) {
          let workerBindingSize = service.worker.bindings.length ?? 0
          let structServiceWorkerBindings: List<Worker_Binding> = structServiceWorker.initBindings(workerBindingSize)
          createBinaryBinding(service.worker.bindings, structServiceWorkerBindings)

          structServiceWorker.setBindings(structServiceWorkerBindings)
        }

        if (service.worker?.serviceWorkerScript?.content) {
          structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript.content)
        }

        if (service.worker.modules) {
          let modulesSize = service.worker.modules.length ?? 0
          let structServiceWorkerModules: List<Worker_Module> = structServiceWorker.initModules(modulesSize)

          service.worker.modules.forEach((module: WorkerModule, index: number) => {
            let moduleStruct: Worker_Module = structServiceWorkerModules.get(index)

            moduleStruct.setName(module.name)
            let content = module.content

            switch (module.type) {
              case 'esModule':
                moduleStruct.setEsModule(content)
                break
              case 'commonJsModule':
                moduleStruct.setCommonJsModule(content)
                break
              case 'text':
                moduleStruct.setText(content)
                break
              case 'data':
                var data: Data = moduleStruct.initData(module.toUint8Array.byteLength)
                data.copyBuffer(module.toUint8Array)
                moduleStruct.setData(data)
                break
              case 'json':
                moduleStruct.setJson(content)
                break
              case 'wasm':
                var wasm_data: Data = moduleStruct.initData(module.toUint8Array.byteLength)
                wasm_data.copyBuffer(module.toUint8Array)
                moduleStruct.setWasm(wasm_data)
                break
              case 'nodeJsCompatModule':
                moduleStruct.setNodeJsCompatModule(content)
                break
              case 'pythonModule':
                moduleStruct.setPythonModule(content)
                break
              case 'pythonRequirement':
                moduleStruct.setPythonRequirement(content)
                break
              default:
                throw new Error('Unknow module type')
            }
          })

          structServiceWorker.setModules(structServiceWorkerModules)
        }

        if (service.worker.durableObjectUniqueKeyModifier) {
          structServiceWorker.setDurableObjectUniqueKeyModifier(service.worker.durableObjectUniqueKeyModifier)
        }

        if (service.worker.durableObjectStorage) {
          let structServiceWorkerDurableObjectStorage: Worker_DurableObjectStorage = structServiceWorker.initDurableObjectStorage()
          if (service.worker.durableObjectStorage.inMemory) {
            structServiceWorkerDurableObjectStorage.setInMemory()
          }

          if (service.worker.durableObjectStorage.localDisk) {
            structServiceWorkerDurableObjectStorage.setLocalDisk(service.worker.durableObjectStorage.localDisk)
          }
        }

        if (service.worker.durableObjectNamespaces) {
          let nameSpacesSize = service.worker.durableObjectNamespaces.length ?? 0
          let structServiceWorkerDurableObjectNamespaces: List<Worker_DurableObjectNamespace> = structServiceWorker.initDurableObjectNamespaces(nameSpacesSize)

          service.worker.durableObjectNamespaces.forEach((namespace: DurableObjectNamespace, index: number) => {
            let namespaceStruct = structServiceWorkerDurableObjectNamespaces.get(index)
            if (namespace.className) {
              namespaceStruct.setClassName(namespace.className)
            }

            if (namespace.uniqueKey) {
              namespaceStruct.setUniqueKey(namespace.uniqueKey)
            }
          })

          structServiceWorker.setDurableObjectNamespaces(structServiceWorkerDurableObjectNamespaces)
        }
      }
    })

    this.struct.setServices(structServices)
  }

  private generateSockets() {
    let size = this.config.sockets.length ?? 0

    let structSockets: List<CapSocket> = this.struct.initSockets(size)

    this.config.sockets.forEach((socket: Socket, index) => {
      let structSocket: CapSocket = structSockets.get(index)

      if (socket.name) {
        structSocket.setName(socket.name)
      }

      if (socket.address) {
        structSocket.setAddress(socket.address)
      }

      if (socket.service) {
        let structSocketService = structSocket.initService()
        if (socket.service.name) {
          structSocketService.setName(socket.service.name)
        }

        if (socket.service.entrypoint) {
          structSocketService.setEntrypoint(socket.service.entrypoint)
        }

        structSocket.setService(structSocketService)
      }

      //if (socket.https) {
      //  let structSocketHttps: Socket_Https = structSocket.initHttps()
      //  if (socket.https.keypair) {
      //    let structSocketHttpsTls = structSocketHttps.initTlsOptions()
      //    let structSocketHttpsKeypair = structSocketHttpsTls.initKeypair()
      //
      //    if (socket.https.keypair.privateKey.content) {
      //      structSocketHttpsKeypair.setPrivateKey(socket.https.keypair.privateKey.content)
      //    }
      //
      //    if (socket.https.keypair.certificateChain.content) {
      //      structSocketHttpsKeypair.setCertificateChain(socket.https.keypair.certificateChain.content)
      //    }
      //
      //    structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
      //    structSocketHttps.setTlsOptions(structSocketHttpsTls)
      //  }
      //}

      if (socket.http) {
        let structSocketHttp: HttpOptions = structSocket.initHttp()
        if (socket.http.style) {
          structSocketHttp.setStyle(socket.http.style)
        }

        if (socket.http.injectRequestHeaders && socket.http.injectRequestHeaders.length > 0) {
          let size = socket.http.injectRequestHeaders.length ?? 0
          let structSocketHttpInjectRequestHeaders = structSocketHttp.initInjectRequestHeaders(size)

          socket.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions, index: number) => {
            let injectRequestHeader = structSocketHttpInjectRequestHeaders.get(index)
            injectRequestHeader.setName(header.name)
            injectRequestHeader.setValue(header.value)
          })

          structSocketHttp.setInjectRequestHeaders(structSocketHttpInjectRequestHeaders)
        }

        if (socket.http.injectResponseHeaders && socket.http.injectResponseHeaders.length > 0) {
          let size = socket.http.injectResponseHeaders.length ?? 0
          let structSocketHttpInjectResponseHeaders = structSocketHttp.initInjectResponseHeaders(size)

          socket.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions, index: number) => {
            let injectResponseHeader = structSocketHttpInjectResponseHeaders.get(index)
            injectResponseHeader.setName(header.name)
            injectResponseHeader.setValue(header.value)
          })

          structSocketHttp.setInjectResponseHeaders(structSocketHttpInjectResponseHeaders)
        }

        structSocket.setHttp(structSocketHttp)
      }
    })

    this.struct.setSockets(structSockets)
  }

  private generateExtensions() {
    let size = this.config.extensions.length ?? 0
    let structExtensions: List<CapExtension> = this.struct.initExtensions(size)

    this.config.extensions.forEach((extension: Extension, index: number) => {
      let structExtension: CapExtension = structExtensions.get(index)
      let moduleSize = extension.modules.length ?? 0
      let structModulesList: List<Extension_Module> = structExtension.initModules(moduleSize)

      extension.modules.forEach((module: ExtensionModule, index: number) => {
        let structModule: Extension_Module = structModulesList.get(index)
        if (module.name) {
          structModule.setName(module.name)
        }

        if (module.content) {
          structModule.setEsModule(module.content)
        }

        if (module.internal) {
          structModule.setInternal(module.internal)
        }
      })

      structExtension.setModules(structModulesList)
    })

    this.struct.setExtensions(structExtensions)
  }

  private generatePlugins() {
    let services = this.config.services

    for (const service of services) {
      if (service.worker?.plugins && service.worker?.plugins.length > 0) {
        service.worker.plugins.forEach((plugin: Plugin, index: number) => {
          plugin.create(this.config, service)
        })
      }
    }
  }

  private generateOptions() {
    if (this.config.options) {
      if (this.config.options.v8Flags) {
        if (this.config.options.v8Flags.length > 0) {
          let size = this.config.options.v8Flags.length ?? 0
          let structV8Flags: List<string> = this.struct.initV8Flags(size)
          this.config.options.v8Flags.forEach((flag: string, index: number) => {
            structV8Flags.set(index, flag)
          })
        }
      }

      if (this.config.options.autoGates) {
        if (this.config.options.autoGates.length > 0) {
          let size = this.config.options.autoGates.length ?? 0
          let structAutoGates: List<string> = this.struct.initAutogates(size)
          this.config.options.autoGates.forEach((gate: string, index: number) => {
            structAutoGates.set(index, gate)
          })
        }
      }
    }
  }

  private generate(): Buffer {
    try {
      this.generateOptions()
      this.generatePlugins()
      this.generateExtensions()
      this.generateServices()
      this.generateSockets()

      return Buffer.from(this.out.toArrayBuffer())
    } catch (error) {
      throw new Error('Workerd Config generation failed:', { cause: error })
    }
  }

  toBuffer(): Buffer {
    return this.generate()
  }

  toJson(): toJson {
    this.generatePlugins()

    return {
      options: this.config.options,
      extensions: this.config.extensions,
      services: this.config.services,
      sockets: this.config.sockets,
    }
  }
}
