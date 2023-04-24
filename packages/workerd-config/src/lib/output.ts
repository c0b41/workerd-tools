import { default as WorkerdConfig } from '.'
import { Data, List, Message, Struct, Void } from 'capnp-ts'
import {
  Config as CapnpConfig,
  Extension,
  Extension_Module,
  Socket as CapSocket,
  Socket_Https,
  HttpOptions,
  ExternalServer,
  Service as CapService,
  Worker as CapWorker,
  Network as CapNetwork,
  ExternalServer_Https,
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
import { IHttpHeaderInjectOptions, toJson } from '@types'
import { DurableObjectNamespace, ExtensionModule, Service, Socket, WorkerModule } from '@nodes'
import { unionServices, createBinaryBinding } from '@utils'

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
    let services = [...this.config.preServices, ...this.config.devServices, ...this.config.services]
    let size = services.length ?? 0
    let structServices: List<CapService> = this.struct.initServices(size)

    structServices.forEach((structService: CapService, index: number) => {
      services.forEach((service: Service) => {
        if (service.name) {
          structService.setName(service.name)
        }

        if (service.network) {
          let structServiceNetwork: CapNetwork = structService.initNetwork()

          if (service.network.allow) {
            let allowsize = service.network.allow.length ?? 0
            let structServiceNetworkAllow: List<string> = structServiceNetwork.initAllow(allowsize)

            structServiceNetworkAllow.forEach((allow: string, index: number) => {
              service.network.allow.forEach((network: string) => {
                structServiceNetworkAllow.set(index, network)
              })
            })
            structServiceNetwork.setAllow(structServiceNetworkAllow)
          }

          if (service.network.deny) {
            let denysize = service.network.deny.length ?? 0
            let structServiceNetworkDeny: List<string> = structServiceNetwork.initDeny(denysize)

            structServiceNetworkDeny.forEach((deny: string, index: number) => {
              service.network.deny.forEach((network: string) => {
                structServiceNetworkDeny.set(index, network)
              })
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

            if (
              service.external.http.injectRequestHeaders &&
              service.external.http.injectRequestHeaders.length > 0
            ) {
              let size = service.external.http.injectRequestHeaders.length ?? 0
              let structServiceExternalHttpRequestHeaders: List<HttpOptions_Header> =
                structServiceExternalHttp.initInjectRequestHeaders(size)

              service.external.http.injectRequestHeaders.forEach(
                (header: IHttpHeaderInjectOptions) => {
                  let injectRequestHeader = structServiceExternalHttpRequestHeaders.get(index)
                  injectRequestHeader.setName(header.name)
                  injectRequestHeader.setValue(header.value)
                }
              )

              structServiceExternalHttp.setInjectRequestHeaders(
                structServiceExternalHttpRequestHeaders
              )
            }

            if (
              service.external.http.injectResponseHeaders &&
              service.external.http.injectResponseHeaders.length > 0
            ) {
              let size = service.external.http.injectResponseHeaders.length ?? 0
              let structServiceExternalHttpResponseHeaders: List<HttpOptions_Header> =
                structServiceExternalHttp.initInjectResponseHeaders(size)

              service.external.http.injectResponseHeaders.forEach(
                (header: IHttpHeaderInjectOptions) => {
                  let injectResponseHeader = structServiceExternalHttpResponseHeaders.get(index)
                  injectResponseHeader.setName(header.name)
                  injectResponseHeader.setValue(header.value)
                }
              )

              structServiceExternalHttp.setInjectResponseHeaders(
                structServiceExternalHttpResponseHeaders
              )
            }

            structServiceExternal.setHttp(structServiceExternalHttp)
          }

          if (service.external.https) {
            let structServiceExternalHttps: ExternalServer_Https = structServiceExternal.initHttps()

            if (service.external.https.keypair) {
              let structSocketHttpsTls: TlsOptions = structServiceExternalHttps.initTlsOptions()
              let structSocketHttpsKeypair: TlsOptions_Keypair = structSocketHttpsTls.initKeypair()

              if (service.external.https.keypair.privateKey.content) {
                structSocketHttpsKeypair.setPrivateKey(
                  service.external.https.keypair.privateKey.content
                )
              }

              if (service.external.https.keypair.certificateChain.content) {
                structSocketHttpsKeypair.setCertificateChain(
                  service.external.https.keypair.certificateChain.content
                )
              }

              structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
              structServiceExternalHttps.setTlsOptions(structSocketHttpsTls)
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
            let structServiceWorkerCompatibilityFlags: List<string> =
              structServiceWorker.initCompatibilityFlags(flagsSize)

            structServiceWorkerCompatibilityFlags.forEach((structFlag: string, index: number) => {
              service.worker.compatibilityFlags.forEach((flag: string) => {
                structServiceWorkerCompatibilityFlags.set(index, flag)
              })
            })
          }

          if (service.worker.cacheApiOutbound) {
            let structServiceWorkerCacheApiOut: ServiceDesignator =
              structServiceWorker.initCacheApiOutbound()
            structServiceWorkerCacheApiOut.setName(service.worker.cacheApiOutbound)
            structServiceWorker.setCacheApiOutbound(structServiceWorkerCacheApiOut)
          }

          if (service.worker.globalOutbound) {
            let structServiceWorkerGlobalOut: ServiceDesignator =
              structServiceWorker.initGlobalOutbound()
            structServiceWorkerGlobalOut.setName(service.worker.globalOutbound)
            structServiceWorker.setGlobalOutbound(structServiceWorkerGlobalOut)
          }

          if (service.worker.bindings) {
            let workerBindingSize = service.worker.bindings.length ?? 0
            let structServiceWorkerBindings: List<Worker_Binding> =
              structServiceWorker.initBindings(workerBindingSize)
            createBinaryBinding(service.worker.bindings, structServiceWorkerBindings)

            structServiceWorker.setBindings(structServiceWorkerBindings)
          }

          if (service.worker?.serviceWorkerScript?.content) {
            structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript.content)
          }

          if (service.worker.modules) {
            let modulesSize = service.worker.modules.length ?? 0
            let structServiceWorkerModules: List<Worker_Module> =
              structServiceWorker.initModules(modulesSize)

            structServiceWorkerModules.forEach((moduleStruct: Worker_Module, index: number) => {
              service.worker.modules.forEach((module: WorkerModule) => {
                if (module.name) {
                  moduleStruct.setName(module.name)
                }

                let content = module.content
                let data: Data = moduleStruct.initData(module.toUint8Array.byteLength)
                data.copyBuffer(module.toUint8Array)
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
                    moduleStruct.setData(data)
                    break
                  case 'json':
                    moduleStruct.setJson(content)
                    break
                  case 'wasm':
                    moduleStruct.setWasm(data)
                    break
                  default:
                    throw new Error('Unknow module type')
                }
              })
            })

            structServiceWorker.setModules(structServiceWorkerModules)
          }

          if (service.worker.durableObjectUniqueKeyModifier) {
            structServiceWorker.setDurableObjectUniqueKeyModifier(
              service.worker.durableObjectUniqueKeyModifier
            )
          }

          if (service.worker.durableObjectStorage) {
            let structServiceWorkerDurableObjectStorage: Worker_DurableObjectStorage =
              structServiceWorker.initDurableObjectStorage()
            if (service.worker.durableObjectStorage.inMemory) {
              structServiceWorkerDurableObjectStorage.setInMemory()
            }

            if (service.worker.durableObjectStorage.localDisk) {
              structServiceWorkerDurableObjectStorage.setLocalDisk(
                service.worker.durableObjectStorage.localDisk
              )
            }
          }

          if (service.worker.durableObjectNamespaces) {
            let nameSpacesSize = service.worker.durableObjectNamespaces.length ?? 0
            let structServiceWorkerDurableObjectNamespaces: List<Worker_DurableObjectNamespace> =
              structServiceWorker.initDurableObjectNamespaces(nameSpacesSize)

            structServiceWorkerDurableObjectNamespaces.forEach(
              (namespaceStruct: Worker_DurableObjectNamespace, index: number) => {
                service.worker.durableObjectNamespaces.forEach(
                  (namespace: DurableObjectNamespace) => {
                    if (namespace.className) {
                      namespaceStruct.setClassName(namespace.className)
                    }

                    if (namespace.uniqueKey) {
                      namespaceStruct.setUniqueKey(namespace.uniqueKey)
                    }
                  }
                )
              }
            )

            structServiceWorker.setDurableObjectNamespaces(
              structServiceWorkerDurableObjectNamespaces
            )
          }
        }
      })
    })
  }

  private generateSockets() {
    let size = this.config.sockets.length ?? 0
    let sockets: List<CapSocket> = this.struct.initSockets(size)

    sockets.forEach((structSocket: CapSocket, index: number) => {
      this.config.sockets.forEach((socket: Socket) => {
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

        if (socket.https) {
          let structSocketHttps: Socket_Https = structSocket.initHttps()
          if (socket.https.keypair) {
            let structSocketHttpsTls = structSocketHttps.initTlsOptions()
            let structSocketHttpsKeypair = structSocketHttpsTls.initKeypair()

            if (socket.https.keypair.privateKey.content) {
              structSocketHttpsKeypair.setPrivateKey(socket.https.keypair.privateKey.content)
            }

            if (socket.https.keypair.certificateChain.content) {
              structSocketHttpsKeypair.setCertificateChain(
                socket.https.keypair.certificateChain.content
              )
            }

            structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
            structSocketHttps.setTlsOptions(structSocketHttpsTls)
          }
        }

        if (socket.http) {
          let structSocketHttp: HttpOptions = structSocket.initHttp()
          if (socket.http.style) {
            structSocketHttp.setStyle(socket.http.style)
          }

          if (socket.http.injectRequestHeaders && socket.http.injectRequestHeaders.length > 0) {
            let size = socket.http.injectRequestHeaders.length ?? 0
            let structSocketHttpInjectRequestHeaders =
              structSocketHttp.initInjectRequestHeaders(size)

            socket.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions) => {
              let injectRequestHeader = structSocketHttpInjectRequestHeaders.get(index)
              injectRequestHeader.setName(header.name)
              injectRequestHeader.setValue(header.value)
            })

            structSocketHttp.setInjectRequestHeaders(structSocketHttpInjectRequestHeaders)
          }

          if (socket.http.injectResponseHeaders && socket.http.injectResponseHeaders.length > 0) {
            let size = socket.http.injectResponseHeaders.length ?? 0
            let structSocketHttpInjectResponseHeaders =
              structSocketHttp.initInjectResponseHeaders(size)

            socket.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions) => {
              let injectResponseHeader = structSocketHttpInjectResponseHeaders.get(index)
              injectResponseHeader.setName(header.name)
              injectResponseHeader.setValue(header.value)
            })

            structSocketHttp.setInjectResponseHeaders(structSocketHttpInjectResponseHeaders)
          }

          structSocket.setHttp(structSocketHttp)
        }
      })
    })
  }

  private generateExtension() {
    let extension: List<Extension> = this.struct.initExtensions(1)
    let structExtension = extension.get(1)

    let moduleSize = this.config.extensions.modules.length ?? 0
    let structModulesList = structExtension.initModules(moduleSize)

    structModulesList.forEach((structModule: Extension_Module, index: number) => {
      this.config.extensions.modules.forEach((module: ExtensionModule) => {
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
    })
  }

  private generate(): Buffer {
    try {
      this.generateExtension()
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
    return {
      extensions: this.config.extensions,
      services: Array.from(this.config.services),
      pre_services: Array.from(this.config.preServices),
      sockets: Array.from(this.config.sockets),
      dev_services: Array.from(this.config.devServices),
    }
  }
}
