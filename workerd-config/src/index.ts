import * as dockerNames from 'docker-names'
import { serializeConfig } from './config'
import * as fs from 'fs'
import { generateWorkerScript } from './utils'
import preConfig from './pre'

export default class WorkerdConfig {
  private services: Array<Service> = []
  private pre_services: Array<Service> = []
  private sockets: Array<Socket> = []
  private readonly loopback: LoopBackOptions | null = null
  constructor(options: WorkerdConfigOptions) {
    this.loopback = options.loopback
    this.preInitServices()
  }

  private preInitServices() {
    if (this.loopback) {
      this.pre_services.push({
        name: 'loop',
        external: {
          address: this.loopback.address,
        },
      })
    }

    return this
  }

  private createLoopBackService(
    type: LoopBackServiceType,
    id: String,
    service: Service,
    loopback: LoopBackOptions
  ) {
    let compatibilityDate = service.worker?.compatibilityDate ?? '2022-09-16'

    let script = generateWorkerScript(type)

    let _service: Service = {
      name: `loop:${type}:${service.name}:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
        serviceWorkerScript: script,
      },
    }

    if (type == 'kv') {
      _service.worker.bindings = [
        {
          name: 'BINDING_PLUGIN',
          type: 'text',
          value: 'kv',
        },
        {
          name: 'BINDING_NAMESPACE',
          type: 'text',
          value: id,
        },
        {
          name: 'BINDING_LOOPBACK',
          type: 'service',
          value: 'loop',
        },
      ]

      if (loopback.path) {
        _service.worker.bindings.push({
          name: 'BINDING_LOOPBACK_PATH',
          type: 'text',
          value: loopback.path,
        })
      }
    }

    if (type == 'cache') {
      _service.worker.bindings = [
        {
          name: 'BINDING_PLUGIN',
          type: 'text',
          value: 'cache',
        },
        {
          name: 'BINDING_NAMESPACE',
          type: 'text',
          value: id,
        },
        {
          name: 'BINDING_LOOPBACK',
          type: 'service',
          value: 'loop',
        },
      ]

      if (loopback.path) {
        _service.worker.bindings.push({
          name: 'BINDING_LOOPBACK_PATH',
          type: 'text',
          value: loopback.path,
        })
      }
    }

    this.pre_services.push(_service)

    return _service
  }

  Service(service: Service) {
    let _service: Service = {
      name: service.name,
      ...service,
    }

    if (this.loopback && service.worker?.cache && service.worker?.cache?.id) {
      let cache_service = this.createLoopBackService(
        'cache',
        service.worker.cache.id,
        service,
        this.loopback
      )
      _service.worker.cacheApiOutbound = cache_service.name
    }

    if (this.loopback && service.worker?.kv && Array.isArray(service.worker?.kv)) {
      service.worker.kv.forEach((bind) => {
        let kv_service = this.createLoopBackService('kv', bind.id, service, this.loopback)
        _service.worker.bindings.push({
          name: bind.name,
          type: 'kvNamespace',
          value: kv_service.name,
        })
      })
    }

    this.services.push(_service)

    return this
  }

  Socket(socket: Socket) {
    this.sockets.push(socket)
    return this
  }

  Generate(dist: String, type: 'bin' | 'json' = 'bin') {
    let buffer = serializeConfig(preConfig)
    let json = this.toJson()
    let result = type === 'bin' ? buffer : JSON.stringify(json, null, 2)
    fs.writeFileSync(`${dist}config.${type}`, result, 'utf-8')
  }

  toJson(): toJson {
    return {
      services: [...this.services, ...this.pre_services],
      sockets: [...this.sockets],
    }
  }
}
