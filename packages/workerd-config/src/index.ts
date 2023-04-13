import { Extension, Service, Socket, WorkerPlugin, WorkerdConfigOptions } from '../types'
import ConfigOutput from './output'

class WorkerdConfig {
  public extensions: Extension[] = []
  public services: Service[] = []
  public pre_services: Service[] = []
  public dev_services: Service[] = []
  public sockets: Socket[] = []
  private options: WorkerdConfigOptions | null = {}
  public test: boolean
  constructor(options?: WorkerdConfigOptions) {
    this.options = options
    this.test = true
  }

  Service(input: Service) {
    let service: Service = {
      name: input.name,
    }

    if (input.worker) {
      let { plugins, ...rest } = input.worker

      if (plugins && plugins.length > 0) {
        for (const plugin of plugins) {
          let pluginInputs = plugin(this)
          rest = Object.assign({}, rest, pluginInputs)
        }
      }

      // TODO: extract bindings, globalOutbound, cacheApiOutbound

      service = {
        ...service,
        ...rest,
      }
    } else {
      service = input
    }

    this.services.push(service)

    return this
  }

  Extension(input: Extension) {
    this.extensions.push(input)
    return this
  }

  Socket(input: Socket) {
    this.sockets.push(input)
    return this
  }
}

export { WorkerdConfig, ConfigOutput }
