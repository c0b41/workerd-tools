import * as dockerNames from 'docker-names'
import { join } from 'path'
import {
  WorkerdConfig,
  Binding,
  Service,
  WorkerModule,
  Socket,
  Worker,
} from '@c0b41/workerd-config'

export interface DevOptions {
  autoReload?: boolean
  port?: number
}

export default (options: DevOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let minCompatibilityDate = '2023-03-21'

    if (!service?.worker) {
      // only run for worker services
      return
    }

    // Dev service
    let devService = new Service()
    devService.setName(`dev:${service.name}:${dockerNames.getRandomName()}`)
    let devServiceWorker = new Worker()
    devServiceWorker.setcompatibilityDate(minCompatibilityDate)

    let devServiceModule = new WorkerModule()
    devServiceModule.setName(`dev-worker.js`)
    devServiceModule.setPath(join(__dirname, 'plugins/dev/index.esm.js'))
    devServiceModule.setType('esModule')
    devServiceWorker.setModules(devServiceModule)

    // Plugin reload binding
    if (options.autoReload) {
      let devServiceBindingPluginReload = new Binding()
      devServiceBindingPluginReload.setName('SERVICE_RELOAD')
      devServiceBindingPluginReload.setText('cache')
      devServiceWorker.setBindings(devServiceBindingPluginReload)
    }

    // Plugin port binding
    if (options.port) {
      let devServiceBindingPluginPort = new Binding()
      devServiceBindingPluginPort.setName('WS_PORT')
      devServiceBindingPluginPort.setText(options.port.toString())
      devServiceWorker.setBindings(devServiceBindingPluginPort)
    }

    // Plugin service binding dev service <=> user service
    let devServiceBindingPluginService = new Binding()
    devServiceBindingPluginService.setName('SERVICE')
    devServiceBindingPluginService.setService(service.name)
    devServiceWorker.setBindings(devServiceBindingPluginService)

    devService.setWorker(devServiceWorker)
    instance.setServices(devService)

    // Find service socket and replace with devservice
    instance.sockets.forEach((socket: Socket, index: number) => {
      if (socket.service?.name && socket.service.name === service.name) {
        socket.service.setName(devService.name)
      }
    })
  }
}
