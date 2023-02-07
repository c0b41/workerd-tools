import { WorkerdConfig } from '.'
import { serializeConfig } from './config'
import { Data, List, Message, Struct, Void } from 'capnp-ts'
import { Config, kVoid } from './config/workerd'
import { Config as CapnpConfig } from './config/workerd.capnp.js'

export default class ConfigOutput {
  private config: WorkerdConfig | null
  constructor(config: WorkerdConfig) {
    this.config = config
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
        let structServiceWorkerBinding = struct.Worker_Binding()

        if ('type' in binding) {
          switch (binding.type) {
            case 'text':
              structServiceWorkerBinding.setText(binding.value)
              break
            case 'data':
              structServiceWorkerBinding.setData(binding.value)
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
      structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript)
    }

    if (service.worker.modules) {
      let modulesSize = service.worker.modules.length ?? 0
      let structServiceWorkerModules = structServiceWorker.initModules(modulesSize)
      service.worker.modules.forEach((module: ServiceModules, index: number) => {
        let moduleStruct = structServiceWorkerModules.get(index)
        if (module.name) {
          moduleStruct.setName(module.name)
        }

        if (module.esModule) {
          moduleStruct.setEsModule(module.esModule)
        }

        if (module.commonJs) {
          moduleStruct.setCommonJsModule(module.commonJs)
        }
      })

      structServiceWorker.setModules(structServiceWorkerModules)
    }
  }

  private generateServices(struct: Struct) {
    let size = this.config.services.length ?? 0
    // @ts-ignore
    let services = struct.initServices(size)
    this.config.services.forEach((service, index) => {
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
          service.network.allow.forEach((network, index) => {
            structServiceNetworkAllow.set(index, network)
          })
          structServiceNetwork.setAllow(structServiceNetworkAllow)
        }
      }

      if (service.worker) {
        this.generateWorker(service, structService)
      }
    })
  }

  private generatePreServices(struct: Struct) {
    let size = this.config.pre_services.length ?? 0
    // @ts-ignore
    let services = struct.initServices(size)
    this.config.pre_services.forEach((service, index) => {
      // @ts-ignore
      let structService = services.get(index)

      if (service.name) {
        structService.setName(service.name)
      }

      if (service.external) {
        let structServiceExternal = structService.initExternal()
        if (service.external.address) {
          structServiceExternal.setAddress(service.external.address)
        }

        structService.setExternal(structServiceExternal)
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
    this.config.sockets.forEach((socket, index) => {
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
    })
  }

  private generate(type: 'buffer' | 'str'): Buffer {
    const message = new Message()
    const struct = message.initRoot(CapnpConfig)

    this.generatePreServices(struct)
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
