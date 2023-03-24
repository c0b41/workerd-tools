import * as dockerNames from 'docker-names'
import { LoopBackServiceType, Service, Socket, WorkerdConfigOptions } from '../types'
import ConfigOutput from './output'
import { generateWorkerScript } from './utils'

class WorkerdConfig {
  public services: Service[] = []
  public pre_services: Service[] = []
  public dev_services: Service[] = []
  public sockets: Socket[] = []
  private options: WorkerdConfigOptions | null = {
    loopback: null,
  }
  constructor(options?: WorkerdConfigOptions) {
    this.options = options
    this.preInitServices()
  }

  private preInitServices() {
    if (this.options?.loopback && this.options?.loopback?.address) {
      this.pre_services.push({
        name: 'loop',
        external: {
          address: this.options.loopback.address,
        },
      })
    }

    return this
  }

  private createLoopBackService(type: LoopBackServiceType, id: string, service: Service) {
    let compatibilityDate = service.worker?.compatibilityDate ?? '2023-03-21'

    let script = generateWorkerScript(type)

    // TODO: change to new esm module type
    let intService: Service = {
      name: `loop:${type}:${service.name}:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
        serviceWorkerScript: {
          content: script,
        },
      },
    }

    if (type == 'kv') {
      intService.worker.bindings = [
        {
          name: 'LOOP_PLUGIN',
          type: 'text',
          content: 'kv',
        },
        {
          name: 'LOOP_NAMESPACE',
          type: 'text',
          content: id,
        },
        {
          name: 'LOOP_SERVICE',
          service: 'loop',
        },
      ]

      if (this.options.loopback.path) {
        intService.worker.bindings.push({
          name: 'LOOP_PLUGIN_PATH',
          type: 'text',
          content: this.options.loopback.path,
        })
      }
    }

    if (type == 'cache') {
      intService.worker.bindings = [
        {
          name: 'LOOP_PLUGIN',
          type: 'text',
          content: 'cache',
        },
        {
          name: 'LOOP_CACHE_ID',
          type: 'text',
          content: id,
        },
        {
          name: 'LOOP_SERVICE',
          service: 'loop',
        },
      ]

      if (this.options.loopback.path) {
        intService.worker.bindings.push({
          name: 'LOOP_PLUGIN_PATH',
          type: 'text',
          content: this.options.loopback.path,
        })
      }
    }

    // https://github.com/cloudflare/workerd/pull/413
    // TODO: wait for relase
    // TODO: require new esm module
    if (type == 'd1') {
    }

    if (type == 'analytics') {
    }

    this.pre_services.push(intService)

    return intService
  }

  Service(input: Service) {
    let service: Service = {
      name: input.name,
      ...input,
    }

    if (this.options?.loopback) {
      if (input.worker?.loop?.cache && input.worker?.loop?.cache?.id) {
        let cache_service = this.createLoopBackService('cache', input.worker.loop.cache.id, input)
        service.worker.cacheApiOutbound = cache_service.name
      }

      if (input.worker?.loop?.kv && Array.isArray(input.worker?.loop?.kv)) {
        input.worker.loop.kv.forEach((bind) => {
          let kv_service = this.createLoopBackService('kv', bind.id, input)
          service.worker.bindings.push({
            name: bind.name,
            kvNamespace: kv_service.name,
          })
        })
      }

      //if (input.worker?.loop?.database) {
      //}
    }

    this.services.push(service)

    return this
  }

  Socket(input: Socket) {
    this.sockets.push(input)
    return this
  }
}

export { WorkerdConfig, ConfigOutput, generateWorkerScript }
