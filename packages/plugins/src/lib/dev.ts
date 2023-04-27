import * as dockerNames from 'docker-names'
import { DevOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import {
  Binding,
  Service,
  Socket,
  SocketService,
  WorkerModule,
} from '@c0b41/workerd-config/lib/nodes/index'

export default (options: DevOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    // Dev service
    let devService = new Service()
    devService.setName(`dev:${service.name}:${dockerNames.getRandomName()}`)
    devService.worker.setcompatibilityDate(compatibilityDate)

    let devServiceModule = new WorkerModule()
    devServiceModule.setName(`dev-worker.js`)
    devServiceModule.setPath(`./dist/plugins/dev/index.esm.js`)
    devServiceModule.setType('esModule')
    devService.worker.setModules(devServiceModule)

    // Plugin reload binding
    let devServiceBindingPluginReload = new Binding()
    devServiceBindingPluginReload.setText('cache')
    devService.worker.setBindings(devServiceBindingPluginReload)

    // Plugin port binding
    let devServiceBindingPluginPort = new Binding()
    devServiceBindingPluginPort.setText(options.port.toString())
    devService.worker.setBindings(devServiceBindingPluginPort)

    // Plugin service binding dev service <=> user service
    let devServiceBindingPluginService = new Binding()
    devServiceBindingPluginService.setService(service.name)
    devService.worker.setBindings(devServiceBindingPluginService)

    // instance.setService(devService)

    instance.sockets.forEach((socket: Socket, index: number) => {
      if (socket.service?.name && socket.service.name === service.name) {
        let socketservice = new SocketService()
        socketservice.setName(service.name)
        socket.setService(socketservice)
      }
    })
  }
}
