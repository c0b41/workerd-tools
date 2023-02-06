import * as dockerNames from 'docker-names'
import ConfigOutput from './output'
import { generateWorkerScript } from './utils'

class WorkerdConfig {
  public services: Array<Service> = []
  public pre_services: Array<Service> = []
  public sockets: Array<Socket> = []
  private options: WorkerdConfigOptions | null
  constructor(options: WorkerdConfigOptions) {
    this.options = options
    this.preInitServices()
  }

  private preInitServices() {
    if (this.options.loopback) {
      this.pre_services.push({
        name: 'loop',
        external: {
          address: this.options.loopback.address,
        },
      })
    }

    if (this.options.prettyErrors) {
      // TODO
    }

    if (this.options.autoReload) {
      // TODO
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

  extendConfig(options) {
    this.options = Object.assign({}, this.options, options)
    this.preInitServices()
  }

  Service(service: Service) {
    let _service: Service = {
      name: service.name,
      ...service,
    }

    if (this.options.loopback && service.worker?.cache && service.worker?.cache?.id) {
      let cache_service = this.createLoopBackService(
        'cache',
        service.worker.cache.id,
        service,
        this.options.loopback
      )
      _service.worker.cacheApiOutbound = cache_service.name
    }

    if (this.options.loopback && service.worker?.kv && Array.isArray(service.worker?.kv)) {
      service.worker.kv.forEach((bind) => {
        let kv_service = this.createLoopBackService('kv', bind.id, service, this.options.loopback)
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
}

export { WorkerdConfig, ConfigOutput }
