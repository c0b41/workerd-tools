import * as dockerNames from 'docker-names'
import ConfigOutput from './output'
import { generateWorkerScript } from './utils'

class WorkerdConfig {
  public services: Array<Service> = []
  public pre_services: Array<Service> = []
  public dev_services: Array<Service> = []
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

  private createLoopBackService(type: LoopBackServiceType, id: String, service: Service) {
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
          name: 'LOOP_PLUGIN',
          type: 'text',
          value: 'kv',
        },
        {
          name: 'LOOP_NAMESPACE',
          type: 'text',
          value: id,
        },
        {
          name: 'LOOP_SERVICE',
          service: 'loop',
        },
      ]

      if (this.options.loopback.path) {
        _service.worker.bindings.push({
          name: 'LOOP_PLUGIN_PATH',
          type: 'text',
          value: this.options.loopback.path,
        })
      }
    }

    if (type == 'cache') {
      _service.worker.bindings = [
        {
          name: 'LOOP_PLUGIN',
          type: 'text',
          value: 'cache',
        },
        {
          name: 'LOOP_NAMESPACE',
          type: 'text',
          value: id,
        },
        {
          name: 'LOOP_SERVICE',
          service: 'loop',
        },
      ]

      if (this.options.loopback.path) {
        _service.worker.bindings.push({
          name: 'LOOP_PLUGIN_PATH',
          type: 'text',
          value: this.options.loopback.path,
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

    if (this.options.loopback && service.worker?.loop?.cache && service.worker?.loop?.cache?.id) {
      let cache_service = this.createLoopBackService('cache', service.worker.loop.cache.id, service)
      _service.worker.cacheApiOutbound = cache_service.name
    }

    if (
      this.options.loopback &&
      service.worker?.loop?.kv &&
      Array.isArray(service.worker?.loop?.kv)
    ) {
      service.worker.loop.kv.forEach((bind) => {
        let kv_service = this.createLoopBackService('kv', bind.id, service)
        _service.worker.bindings.push({
          name: bind.name,
          kvNamespace: kv_service.name,
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
