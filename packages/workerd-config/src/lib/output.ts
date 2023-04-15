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
} from './config/workerd.capnp.js'
import { IHttpHeaderInjectOptions, toJson } from '../../types'
import { DurableObjectNamespace, ExtensionModule, IBinding, Service, Socket } from './nodes'
import { unionServices } from './helper'

export default class WorkerdOutput {
  private config: WorkerdConfig | null
  private struct: CapnpConfig
  constructor(config: WorkerdConfig) {
    this.config = config
  }

  private generateWorker(service: Service, struct: CapService) {
    let structServiceWorker: CapWorker = struct.initWorker()

    if (service.worker.compatibilityDate) {
      structServiceWorker.setCompatibilityDate(service.worker.compatibilityDate)
    }

    if (service.worker.compatibilityFlags) {
      let flagsSize = service.worker.compatibilityFlags.length ?? 0
      let structServiceWorkerCompatibilityFlags =
        structServiceWorker.initCompatibilityFlags(flagsSize)
      service.worker.compatibilityFlags.forEach((flag: string, index: number) => {
        structServiceWorkerCompatibilityFlags.set(index, flag)
      })
    }

    if (service.worker.cacheApiOutbound) {
      let structServiceWorkerCacheApiOut = structServiceWorker.initCacheApiOutbound()
      structServiceWorkerCacheApiOut.setName(service.worker.cacheApiOutbound)
      structServiceWorker.setCacheApiOutbound(structServiceWorkerCacheApiOut)
    }

    if (service.worker.globalOutbound) {
      let structServiceWorkerGlobalOut = structServiceWorker.initGlobalOutbound()
      structServiceWorkerGlobalOut.setName(service.worker.globalOutbound)
      structServiceWorker.setGlobalOutbound(structServiceWorkerGlobalOut)
    }

    if (service.worker.bindings) {
      let workerBindingSize = service.worker.bindings.size ?? 0
      let structServiceWorkerBindings: List<Worker_Binding> =
        structServiceWorker.initBindings(workerBindingSize)
      this.generateBinding(service.worker.bindings, structServiceWorkerBindings)
    }

    if (service.worker.serviceWorkerScript) {
      if (service.worker.serviceWorkerScript.content) {
        structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript.content)
      }
    }

    if (service.worker.modules) {
      let modulesSize = service.worker.modules.length ?? 0
      let structServiceWorkerModules = structServiceWorker.initModules(modulesSize)
      service.worker.modules.forEach((module: ServiceModules, index: number) => {
        let moduleStruct = structServiceWorkerModules.get(index)
        if (module.name) {
          moduleStruct.setName(module.name)
        }

        let content = module.content ?? null
        if (module.path) {
          content = this.readFile(module.path)
        }
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
            moduleStruct.setData(content)
            break
          case 'json':
            moduleStruct.setJson(content)
            break
          case 'wasm':
            moduleStruct.setWasm(content)
            break
          default:
            throw new Error('Unknow module type')
        }
      })

      structServiceWorker.setModules(structServiceWorkerModules)
    }

    if (service.worker.durableObjectUniqueKeyModifier) {
      structServiceWorker.setDurableObjectUniqueKeyModifier(
        service.worker.durableObjectUniqueKeyModifier
      )
    }

    if (service.worker.durableObjectStorage) {
      let structServiceWorkerDurableObjectStorage = structServiceWorker.initDurableObjectStorage()
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
      let nameSpacesSize = service.worker.durableObjectNamespaces.size ?? 0
      let structServiceWorkerDurableObjectNamespaces: List<Worker_DurableObjectNamespace> =
        structServiceWorker.initDurableObjectNamespaces(nameSpacesSize)

      structServiceWorkerDurableObjectNamespaces.forEach(
        (namespaceStruct: Worker_DurableObjectNamespace, index: number) => {
          service.worker.durableObjectNamespaces.forEach((namespace: DurableObjectNamespace) => {
            if (namespace.className) {
              namespaceStruct.setClassName(namespace.className)
            }

            if (namespace.uniqueKey) {
              namespaceStruct.setUniqueKey(namespace.uniqueKey)
            }
          })
        }
      )

      structServiceWorker.setDurableObjectNamespaces(structServiceWorkerDurableObjectNamespaces)
    }
  }

  private generateExternal(service: Service, struct: CapService) {
    let structServiceExternal: ExternalServer = struct.initExternal()

    if (service.external.address) {
      structServiceExternal.setAddress(service.external.address)
    }

    if (service.external.http) {
      let structServiceExternalHttp: HttpOptions = structServiceExternal.initHttp()

      if (service.external.http.style) {
        structServiceExternalHttp.setStyle(service.external.http.styleIndex)
      }

      if (
        service.external.http.injectRequestHeaders &&
        service.external.http.injectRequestHeaders.size > 0
      ) {
        let size = service.external.http.injectRequestHeaders.size ?? 0
        let structServiceExternalHttpRequestHeaders =
          structServiceExternalHttp.initInjectRequestHeaders(size)

        service.external.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions) => {
          let injectRequestHeader = structServiceExternalHttpRequestHeaders.get(index)
          injectRequestHeader.setName(header.name)
          injectRequestHeader.setValue(header.value)
        })

        structServiceExternalHttp.setInjectRequestHeaders(structServiceExternalHttpRequestHeaders)
      }

      if (
        service.external.http.injectResponseHeaders &&
        service.external.http.injectResponseHeaders.size > 0
      ) {
        let size = service.external.http.injectResponseHeaders.size ?? 0
        let structServiceExternalHttpResponseHeaders =
          structServiceExternalHttp.initInjectResponseHeaders(size)

        service.external.http.injectResponseHeaders.forEach((header: IHttpHeaderInjectOptions) => {
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

      if (service.external.https.keypair) {
        let structSocketHttpsTls: TlsOptions = structServiceExternalHttps.initTlsOptions()
        let structSocketHttpsKeypair: TlsOptions_Keypair = structSocketHttpsTls.initKeypair()

        if (service.external.https.keypair.privateKey.content) {
          structSocketHttpsKeypair.setPrivateKey(service.external.https.keypair.privateKey.content)
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

  private generateBinding(
    bindings: Set<IBinding>,
    structServiceWorkerBindings: List<Worker_Binding>
  ) {
    structServiceWorkerBindings.forEach(
      (structServiceWorkerBinding: Worker_Binding, index: number) => {
        bindings.forEach((binding: IBinding) => {
          switch (binding.type) {
            case 'text':
              structServiceWorkerBinding.setText(binding.content)
              break
            case 'data':
              let structServiceWorkerBindingData = structServiceWorkerBinding.initData(
                binding.content
              )
              structServiceWorkerBindingData.copyBuffer(bindingContent)
              structServiceWorkerBinding.setData(structServiceWorkerBindingData)
              break
            case 'json':
              structServiceWorkerBinding.setJson(bindingContent)
              break
            case 'wasm':
              structServiceWorkerBinding.setWasm(bindingContent)
            default:
              throw new Error(`Unknow binding Type ${binding.type}`)
          }

          if ('service' in binding) {
            let structServiceWorkerBindingService = structServiceWorkerBinding.initService()
            structServiceWorkerBindingService.setName(binding.service)
            structServiceWorkerBinding.setService(structServiceWorkerBindingService)
          }

          if ('kvNamespace' in binding) {
            let structServiceWorkerBindingKV = structServiceWorkerBinding.initKvNamespace()
            structServiceWorkerBindingKV.setName(binding.kvNamespace)
            structServiceWorkerBinding.setKvNamespace(structServiceWorkerBindingKV)
          }

          if ('r2Bucket' in binding) {
            let structServiceWorkerBindingR2 = structServiceWorkerBinding.initR2Bucket()
            structServiceWorkerBindingR2.setName(binding.r2Bucket)
            structServiceWorkerBinding.setR2Bucket(structServiceWorkerBindingR2)
          }

          if ('queue' in binding) {
            let structServiceWorkerBindingQueue = structServiceWorkerBinding.initQueue()
            structServiceWorkerBindingQueue.setName(binding.queue)
            structServiceWorkerBinding.setQueue(structServiceWorkerBindingQueue)
          }

          if ('cryptoKey' in binding) {
            let structServiceWorkerBindingCrypto = structServiceWorkerBinding.initCryptoKey()

            if (binding.cryptoKey.raw) {
              structServiceWorkerBindingCrypto.setRaw(binding.cryptoKey.raw)
            }

            if (binding.cryptoKey.base64) {
              structServiceWorkerBindingCrypto.setBase64(binding.cryptoKey.base64)
            }

            if (binding.cryptoKey.hex) {
              structServiceWorkerBindingCrypto.setHex(binding.cryptoKey.hex)
            }

            if (binding.cryptoKey.jwk) {
              structServiceWorkerBindingCrypto.setJwk(binding.cryptoKey.jwk)
            }

            if (binding.cryptoKey.pkcs8) {
              structServiceWorkerBindingCrypto.setPkcs8(binding.cryptoKey.pkcs8)
            }

            if (binding.cryptoKey.spki) {
              structServiceWorkerBindingCrypto.setSpki(binding.cryptoKey.spki)
            }

            if (binding.cryptoKey.algorithm && binding.cryptoKey.algorithm.json) {
              let structServiceWorkerBindingCryptoAlgo =
                structServiceWorkerBindingCrypto.initAlgorithm()
              structServiceWorkerBindingCryptoAlgo.setJson(binding.cryptoKey.algorithm.json)
            }

            if (binding.cryptoKey.usages && binding.cryptoKey.usages.length > 0) {
              let usagesSize = binding.cryptoKey.usages.length ?? 0
              let structServiceWorkerBindingCryptoUsages =
                structServiceWorkerBindingCrypto.initUsages(usagesSize)

              binding.cryptoKey.usages.forEach((usage: string, index: number) => {
                structServiceWorkerBindingCryptoUsages.set(index, usage)
              })
            }

            if (binding.cryptoKey.extractable) {
              structServiceWorkerBindingCrypto.setExtractable(binding.cryptoKey.extractable)
            }

            structServiceWorkerBinding.setCryptoKey(structServiceWorkerBindingCrypto)
          }

          if ('durableObjectNamespace' in binding) {
            let structServiceWorkerBindingDurableObjectNamespace =
              structServiceWorkerBinding.initDurableObjectNamespace()

            structServiceWorkerBindingDurableObjectNamespace.setClassName(
              binding.durableObjectNamespace
            )
            structServiceWorkerBinding.setName(binding.name)
            structServiceWorkerBinding.setDurableObjectNamespace(
              structServiceWorkerBindingDurableObjectNamespace
            )
          }

          if ('wrapped' in binding) {
            let structServiceWorkerBindingWrapped = structServiceWorkerBinding.initWrapped()

            if (binding.wrapped.moduleName) {
              structServiceWorkerBindingWrapped.setModuleName(binding.wrapped.moduleName)
            }

            if (binding.wrapped.entrypoint) {
              structServiceWorkerBindingWrapped.setEntrypoint(binding.wrapped.entrypoint)
            }
            if (binding.wrapped.innerBindings) {
              let wrappedBindingSize = binding.wrapped.innerBindings.size ?? 0
              let structServiceWorkerWrappedBindings =
                structServiceWorkerBindingWrapped.initInnerBindings(wrappedBindingSize)
              //this.generateBinding(
              //  binding.wrapped.innerBindings,
              //  structServiceWorkerWrappedBindings
              //)
            }

            structServiceWorkerBinding.setWrapped(structServiceWorkerBindingWrapped)
          }

          structServiceWorkerBinding.setName(binding.name)
          // @ts-ignore
          structServiceWorkerBindings.set(index, structServiceWorkerBinding)
        })
      }
    )
  }

  private generateServices() {
    let services = unionServices([
      this.config.preServices,
      this.config.devServices,
      this.config.services,
    ])
    let size = services.size ?? 0
    let structServices: List<CapService> = this.struct.initServices(size)

    structServices.forEach((structService: CapService, index: number) => {
      services.forEach((service: Service) => {
        if (service.name) {
          structService.setName(service.name)
        }

        if (service.network) {
          let structServiceNetwork: CapNetwork = structService.initNetwork()

          if (service.network.allow) {
            let allowsize = service.network.allow.size ?? 0
            let structServiceNetworkAllow: List<string> = structServiceNetwork.initAllow(allowsize)

            structServiceNetworkAllow.forEach((allow: string, index: number) => {
              service.network.allow.forEach((network: string) => {
                structServiceNetworkAllow.set(index, network)
              })
            })
            structServiceNetwork.setAllow(structServiceNetworkAllow)
          }

          if (service.network.deny) {
            let denysize = service.network.deny.size ?? 0
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
          this.generateExternal(service, structService)
        }

        if (service.worker) {
          this.generateWorker(service, structService)
        }
      })
    })
  }

  private generateSockets() {
    let size = this.config.sockets.size ?? 0
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
            structSocketHttp.setStyle(socket.http.styleIndex)
          }

          if (socket.http.injectRequestHeaders && socket.http.injectRequestHeaders.size > 0) {
            let size = socket.http.injectRequestHeaders.size ?? 0
            let structSocketHttpInjectRequestHeaders =
              structSocketHttp.initInjectRequestHeaders(size)

            socket.http.injectRequestHeaders.forEach((header: IHttpHeaderInjectOptions) => {
              let injectRequestHeader = structSocketHttpInjectRequestHeaders.get(index)
              injectRequestHeader.setName(header.name)
              injectRequestHeader.setValue(header.value)
            })

            structSocketHttp.setInjectRequestHeaders(structSocketHttpInjectRequestHeaders)
          }

          if (socket.http.injectResponseHeaders && socket.http.injectResponseHeaders.size > 0) {
            let size = socket.http.injectResponseHeaders.size ?? 0
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

    let moduleSize = this.config.extensions.modules.size ?? 0
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
    const message = new Message()
    this.struct = message.initRoot(CapnpConfig)

    this.generateExtension()
    this.generateServices()
    this.generateSockets()

    return Buffer.from(message.toArrayBuffer())
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
