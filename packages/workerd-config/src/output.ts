import { WorkerdConfig } from '.'
import { readFileSync } from 'fs'
import { parse } from 'path'
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
} from '../types'

export default class ConfigOutput {
  private config: WorkerdConfig | null
  constructor(config: WorkerdConfig) {
    this.config = config
  }

  private readFile(path: string) {
    let content = null
    try {
      content = readFileSync(path, 'utf-8')
    } catch (error) {
      //console.log(error)
    } finally {
      return content
    }
  }

  private generateWorker(service: Service, struct: Struct) {
    // @ts-ignore
    let structServiceWorker = struct.initWorker()

    if (service.worker.compatibilityDate) {
      structServiceWorker.setCompatibilityDate(service.worker.compatibilityDate)
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
      let bindingSize = service.worker.bindings.length ?? 0
      let structServiceWorkerBindings = structServiceWorker.initBindings(bindingSize)
      service.worker.bindings.forEach((binding: ServiceBindings, index: number) => {
        // @ts-ignore
        let structServiceWorkerBinding = structServiceWorkerBindings.get(index)

        if ('type' in binding) {
          switch (binding.type) {
            case 'text':
              structServiceWorkerBinding.setText(binding.value)
              break
            case 'data':
              let structServiceWorkerBindingData = structServiceWorkerBinding.initData(
                binding.value.byteLength
              )
              structServiceWorkerBindingData.copyBuffer(binding.value)
              structServiceWorkerBinding.setData(structServiceWorkerBindingData)
              break
            case 'json':
              structServiceWorkerBinding.setJson(binding.value)
              break
            case 'wasm':
              structServiceWorkerBinding.setWasm(binding.value)
            default:
              break
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

        structServiceWorkerBinding.setName(binding.name)
        structServiceWorkerBindings.set(index, structServiceWorkerBinding)
      })
    }

    if (service.worker.serviceWorkerScript) {
      // check for dev services
      let content = this.readFile(service.worker.serviceWorkerScript)
      if (content) {
        structServiceWorker.setServiceWorkerScript(content)
      } else {
        structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript)
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

        if ('esModule' in module) {
          let content = this.readFile(module.esModule)
          moduleStruct.setEsModule(content)
        }

        if ('commonJsModule' in module) {
          let content = this.readFile(module.commonJsModule)
          moduleStruct.setCommonJsModule(content)
        }

        if ('text' in module) {
          moduleStruct.setText(module.text)
        }

        if ('data' in module) {
          moduleStruct.setData(module.data)
        }

        if ('json' in module) {
          moduleStruct.setJson(module.json)
        }

        if ('wasm' in module) {
          moduleStruct.setWasm(module.wasm)
        }
      })

      structServiceWorker.setModules(structServiceWorkerModules)
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
        structSocketHttpsKeypair.setPrivateKey(service.external.https.keypair.privateKey)
        structSocketHttpsKeypair.setCertificateChain(
          service.external.https.keypair.certificateChain
        )
        structSocketHttpsTls.setKeypair(structSocketHttpsKeypair)
        structServiceExternalHttps.setTlsOptions(structSocketHttpsTls)
      }

      structServiceExternal.setHttps(structServiceExternalHttps)
    }
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
        structSocketService.setName(socket.service)
        structSocket.setService(structSocketService)
      }

      if (socket.https) {
        let structSocketHttps = structSocket.initHttps()
        if (socket.https.keypair) {
          let structSocketHttpsTls = structSocketHttps.initTlsOptions()
          let structSocketHttpsKeypair = structSocketHttpsTls.initKeypair()
          structSocketHttpsKeypair.setPrivateKey(socket.https.keypair.privateKey)
          structSocketHttpsKeypair.setCertificateChain(socket.https.keypair.certificateChain)
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

  private generate(type: 'buffer' | 'str'): Buffer {
    const message = new Message()
    const struct = message.initRoot(CapnpConfig)

    this.generateServices(struct)
    this.generateSockets(struct)

    if (type == 'buffer') {
      return Buffer.from(message.toArrayBuffer())
    } else {
      return Buffer.from(message.toString())
    }
  }

  toBuffer(): Buffer {
    return this.generate('buffer')
  }

  toString(): Buffer {
    return this.generate('str')
  }

  toJson(): toJson {
    return {
      services: [...this.config.services],
      pre_services: [...this.config.pre_services],
      sockets: [...this.config.sockets],
      dev_services: [...this.config.dev_services],
    }
  }
}
