import { WorkerdConfig } from '.'
import { readFileSync } from 'fs'
import { Data, List, Message, Struct, Void } from 'capnp-ts'
import { Config as CapnpConfig } from './config/workerd.capnp.js'
import {
  ServiceBindings,
  ServiceModules,
  HttpHeaderInjectOptions,
  toJson,
  Service,
  Socket,
  DurableObjectNamespace,
  Extension,
  ExtensionModule,
} from '../types'

// TODO: write proper typing with workerd.capnp.d.ts

export default class ConfigOutput {
  private config: WorkerdConfig | null
  constructor(config: WorkerdConfig) {
    this.config = config
  }

  private readFile(path: string) {
    try {
      return readFileSync(path, 'utf-8')
    } catch (error) {
      throw new Error(`${path} doesn't exist or failed read`)
    }
  }

  private generateWorker(service: Service, struct: Struct) {
    // @ts-ignore
    let structServiceWorker = struct.initWorker()

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
      let workerBindingSize = service.worker.bindings.length ?? 0
      let structServiceWorkerBindings = structServiceWorker.initBindings(workerBindingSize)
      this.generateBinding(service.worker.bindings, structServiceWorkerBindings)
    }

    if (service.worker.serviceWorkerScript) {
      let content = service.worker.serviceWorkerScript.content ?? null

      if (service.worker.serviceWorkerScript.path) {
        content = this.readFile(service.worker.serviceWorkerScript.path)
      }

      structServiceWorker.setServiceWorkerScript(content)
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
      let nameSpacesSize = service.worker.durableObjectNamespaces.length ?? 0
      let structServiceWorkerDurableObjectNamespaces =
        structServiceWorker.initDurableObjectNamespaces(nameSpacesSize)

      service.worker.durableObjectNamespaces.forEach(
        (namespace: DurableObjectNamespace, index: number) => {
          let namespaceStruct = structServiceWorkerDurableObjectNamespaces.get(index)

          if (namespace.className) {
            namespaceStruct.setClassName(namespace.className)
          }

          if (namespace.uniqueKey) {
            namespaceStruct.setUniqueKey(namespace.uniqueKey)
          }
        }
      )

      structServiceWorker.setDurableObjectNamespaces(structServiceWorkerDurableObjectNamespaces)
    }
  }

  private generateExternal(service: Service, struct: Struct) {
    // @ts-ignore
    let structServiceExternal = struct.initExternal()

    if (service.external.address) {
      structServiceExternal.setAddress(service.external.address)
    }

    if (service.external.http) {
      let structServiceExternalHttp = structServiceExternal.initHttp()

      if (service.external.http.style) {
        structServiceExternalHttp.setStyle(service.external.http.style)
      }

      if (
        service.external.http.injectRequestHeaders &&
        service.external.http.injectRequestHeaders.length > 0
      ) {
        let size = service.external.http.injectRequestHeaders.length ?? 0
        let structServiceExternalHttpRequestHeaders =
          structServiceExternalHttp.initInjectRequestHeaders(size)

        service.external.http.injectRequestHeaders.forEach(
          (header: HttpHeaderInjectOptions, index: number) => {
            let injectRequestHeader = structServiceExternalHttpRequestHeaders.get(index)
            injectRequestHeader.setName(header.name)
            injectRequestHeader.setValue(header.value)
          }
        )

        structServiceExternalHttp.setInjectRequestHeaders(structServiceExternalHttpRequestHeaders)
      }

      if (
        service.external.http.injectResponseHeaders &&
        service.external.http.injectResponseHeaders.length > 0
      ) {
        let size = service.external.http.injectResponseHeaders.length ?? 0
        let structServiceExternalHttpResponseHeaders =
          structServiceExternalHttp.initInjectResponseHeaders(size)

        service.external.http.injectResponseHeaders.forEach(
          (header: HttpHeaderInjectOptions, index: number) => {
            let injectResponseHeader = structServiceExternalHttpResponseHeaders.get(index)
            injectResponseHeader.setName(header.name)
            injectResponseHeader.setValue(header.value)
          }
        )

        structServiceExternalHttp.setInjectResponseHeaders(structServiceExternalHttpResponseHeaders)
      }

      structServiceExternal.setHttp(structServiceExternalHttp)
    }

    if (service.external.https) {
      let structServiceExternalHttps = structServiceExternal.initHttps()

      if (service.external.https.keypair) {
        let structSocketHttpsTls = structServiceExternalHttps.initTlsOptions()
        let structSocketHttpsKeypair = structServiceExternalHttps.initKeypair()

        let privateKeyContent = service.external.https.keypair.privateKey.content ?? null

        if (service.external.https.keypair.privateKey.path) {
          privateKeyContent = this.readFile(service.external.https.keypair.privateKey.path)
        }

        structSocketHttpsKeypair.setPrivateKey(privateKeyContent)

        let certificateChainContent =
          service.external.https.keypair.certificateChain.content ?? null

        if (service.external.https.keypair.certificateChain.path) {
          certificateChainContent = this.readFile(
            service.external.https.keypair.certificateChain.path
          )
        }

        structSocketHttpsKeypair.setCertificateChain(certificateChainContent)
        structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
        structServiceExternalHttps.setTlsOptions(structSocketHttpsTls)
      }

      structServiceExternal.setHttps(structServiceExternalHttps)
    }
  }

  private generateBinding(bindings: ServiceBindings[], structServiceWorkerBindings: Struct) {
    // @ts-ignore
    bindings.forEach((binding: ServiceBindings, index: number) => {
      // @ts-ignore
      let structServiceWorkerBinding = structServiceWorkerBindings.get(index)

      if ('type' in binding) {
        let bindingContent = binding.content ?? ''
        if (binding.path) {
          bindingContent = this.readFile(binding.path)
        }
        switch (binding.type) {
          case 'text':
            structServiceWorkerBinding.setText(bindingContent)
            break
          case 'data':
            let structServiceWorkerBindingData = structServiceWorkerBinding.initData(bindingContent)
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
          let wrappedBindingSize = binding.wrapped.innerBindings.length ?? 0
          let structServiceWorkerWrappedBindings =
            structServiceWorkerBindingWrapped.initInnerBindings(wrappedBindingSize)
          this.generateBinding(binding.wrapped.innerBindings, structServiceWorkerWrappedBindings)
        }

        structServiceWorkerBinding.setWrapped(structServiceWorkerBindingWrapped)
      }

      structServiceWorkerBinding.setName(binding.name)
      // @ts-ignore
      structServiceWorkerBindings.set(index, structServiceWorkerBinding)
    })
  }

  private generateServices(struct: Struct) {
    let servicesList = [
      ...this.config.pre_services,
      ...this.config.dev_services,
      ...this.config.services,
    ]
    let size = servicesList.length ?? 0
    // @ts-ignore
    let services = struct.initServices(size)
    servicesList.forEach((service: Service, index: number) => {
      // @ts-ignore
      let structService = services.get(index)

      if (service.name) {
        structService.setName(service.name)
      }

      if (service.network) {
        let structServiceNetwork = structService.initNetwork()

        if (service.network.allow) {
          let allowsize = service.network.allow.length ?? 0
          let structServiceNetworkAllow = structServiceNetwork.initAllow(allowsize)
          service.network.allow.forEach((network: string, index: number) => {
            structServiceNetworkAllow.set(index, network)
          })
          structServiceNetwork.setAllow(structServiceNetworkAllow)
        }

        if (service.network.deny) {
          let denysize = service.network.deny.length ?? 0
          let structServiceNetworkDeny = structServiceNetwork.initDeny(denysize)
          service.network.deny.forEach((network: string, index: number) => {
            structServiceNetworkDeny.set(index, network)
          })

          structServiceNetwork.setDeny(structServiceNetworkDeny)
        }
      }

      if (service.disk) {
        let structServiceDisk = structService.initDisk()
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
  }

  private generateSockets(struct: Struct) {
    let size = this.config.sockets.length ?? 0
    // @ts-ignore
    let sockets = struct.initSockets(size)
    this.config.sockets.forEach((socket: Socket, index: number) => {
      // @ts-ignore
      let structSocket = sockets.get(index)
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
        let structSocketHttps = structSocket.initHttps()
        if (socket.https.keypair) {
          let structSocketHttpsTls = structSocketHttps.initTlsOptions()
          let structSocketHttpsKeypair = structSocketHttpsTls.initKeypair()

          let privateKeyContent = socket.https.keypair.privateKey.content ?? null

          if (socket.https.keypair.privateKey.path) {
            privateKeyContent = this.readFile(socket.https.keypair.privateKey.path)
          }

          structSocketHttpsKeypair.setPrivateKey(privateKeyContent)

          let certificateChainContent = socket.https.keypair.certificateChain.content ?? null

          if (socket.https.keypair.certificateChain.path) {
            certificateChainContent = this.readFile(socket.https.keypair.certificateChain.path)
          }

          structSocketHttpsKeypair.setCertificateChain(certificateChainContent)
          structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
          structSocketHttps.setTlsOptions(structSocketHttpsTls)
        }

        structSocket.setHttps(structSocketHttps)
      }

      if (socket.http) {
        let structSocketHttp = structSocket.initHttp()
        if (socket.http.style) {
          structSocketHttp.setStyle(socket.http.style)
        }

        if (socket.http.injectRequestHeaders && socket.http.injectRequestHeaders.length > 0) {
          let size = socket.http.injectRequestHeaders.length ?? 0
          let structSocketHttpInjectRequestHeaders = structSocketHttp.initInjectRequestHeaders(size)

          socket.http.injectRequestHeaders.forEach(
            (header: HttpHeaderInjectOptions, index: number) => {
              let injectRequestHeader = structSocketHttpInjectRequestHeaders.get(index)
              injectRequestHeader.setName(header.name)
              injectRequestHeader.setValue(header.value)
            }
          )

          structSocketHttp.setInjectRequestHeaders(structSocketHttpInjectRequestHeaders)
        }

        if (socket.http.injectResponseHeaders && socket.http.injectResponseHeaders.length > 0) {
          let size = socket.http.injectResponseHeaders.length ?? 0
          let structSocketHttpInjectResponseHeaders =
            structSocketHttp.initInjectResponseHeaders(size)

          socket.http.injectResponseHeaders.forEach(
            (header: HttpHeaderInjectOptions, index: number) => {
              let injectResponseHeader = structSocketHttpInjectResponseHeaders.get(index)
              injectResponseHeader.setName(header.name)
              injectResponseHeader.setValue(header.value)
            }
          )

          structSocketHttp.setInjectResponseHeaders(structSocketHttpInjectResponseHeaders)
        }

        structSocket.setHttp(structSocketHttp)
      }
    })
  }

  private generateExtension(struct: Struct) {
    let size = this.config.extensions.length ?? 0
    // @ts-ignore
    let extensions = struct.initExtensions(size)
    this.config.extensions.forEach((extension: Extension, extIndex: number) => {
      // @ts-ignore
      let structExtension = extensions.get(extIndex)

      let moduleSize = extension.modules.length ?? 0
      let modules = structExtension.initModules(moduleSize)

      extension.modules.forEach((module: ExtensionModule, modIndex: number) => {
        let structModule = modules.get(modIndex)
        if (module.name) {
          structModule.setName(module.name)
        }

        let content = module.content ?? null
        if (module.path) {
          content = this.readFile(module.path)
        }

        if (content) {
          structModule.setEsModule(content)
        }

        if (module.internal) {
          structModule.setInternal(module.internal)
        }
      })
    })
  }

  private generate(): Buffer {
    const message = new Message()
    const struct = message.initRoot(CapnpConfig)

    this.generateExtension(struct)
    this.generateServices(struct)
    this.generateSockets(struct)

    return Buffer.from(message.toArrayBuffer())
  }

  toBuffer(): Buffer {
    return this.generate()
  }

  toJson(): toJson {
    return {
      extensions: [...this.config.extensions],
      services: [...this.config.services],
      pre_services: [...this.config.pre_services],
      sockets: [...this.config.sockets],
      dev_services: [...this.config.dev_services],
    }
  }
}
