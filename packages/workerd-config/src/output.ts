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
        let structServiceWorker = structService.initWorker()

        if (service.worker.compatibilityDate) {
          structServiceWorker.setCompatibilityDate(service.worker.compatibilityDate)
        }

        if (service.worker.modules) {
          let modulesSize = service.worker.modules.length ?? 0
          let structServiceWorkerModules = structServiceWorker.initModules(modulesSize)
          service.worker.modules.forEach((module, index) => {
            // Todo
          })

          structServiceWorker.setModules(structServiceWorkerModules)
        }
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
        let structServiceWorker = structService.initWorker()

        if (service.worker.compatibilityDate) {
          structServiceWorker.setCompatibilityDate(service.worker.compatibilityDate)
        }

        if (service.worker.serviceWorkerScript) {
          structServiceWorker.setServiceWorkerScript(service.worker.serviceWorkerScript)
        }

        if (service.worker.bindings) {
          let bindingSize = service.worker.bindings.length ?? 0
          let structServiceWorkerBindings = structServiceWorker.initBindings(bindingSize)
          service.worker.bindings.forEach((binding, index) => {
            // @ts-ignore
            let structServiceWorkerBinding = struct.Worker_Binding()
            switch (binding.type) {
              case 'text':
                structServiceWorkerBinding.isText(true)
                structServiceWorkerBinding.setText(binding.value)
                break
              case 'service':
                let structServiceWorkerBindingService = structService.initService()
                structServiceWorkerBindingService.setName(binding.value)
                structServiceWorkerBinding.setService(structServiceWorkerBindingService)

              case 'json':
                structServiceWorkerBinding.isJson(true)
                structServiceWorkerBinding.setJson(binding.value)
              default:
                break
            }

            structServiceWorkerBindings.set(index, structServiceWorkerBinding)
          })
        }
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
    //this.generateServices(struct)
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
    }
  }
}
