import * as dockerNames from 'docker-names'
import { WorkerdConfig, Binding, External, Service, WorkerModule } from '@c0b41/workerd-config'

export interface KvOptions {
  name: string
  kv_id: string
  API?: {
    base: string
    path?: string
    token?: string
  }
}

export default (options: KvOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    // External Proxy service for internet access
    let kvExternalService = new Service()
    kvExternalService.setName(`external:kv:${service.name}`)
    let externalService = new External()
    externalService.setAddress(options.API.base)

    // instance.setService(kvExternalService)

    // Workerd api <=> Int api service
    let kvService = new Service()
    kvService.setName(`int:kv:${service.name}:${dockerNames.getRandomName()}`)
    kvService.worker.setcompatibilityDate(compatibilityDate)

    // Plugin modules
    let kvServiceModule = new WorkerModule()
    kvServiceModule.setName(`kv-worker.js`)
    kvServiceModule.setPath(`./plugins/kv/index.esm.js`)
    kvServiceModule.setType(`esModule`)
    kvService.worker.setModules(kvServiceModule)

    let cacheServiceBindingPlugin = new Binding()
    cacheServiceBindingPlugin.setText('kv')
    kvService.worker.setBindings(cacheServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API.path) {
      let kvServiceBindingPluginPath = new Binding()
      kvServiceBindingPluginPath.setText(options.API.path)
      kvService.worker.setBindings(kvServiceBindingPluginPath)
    }

    // Plugin kv id binding
    if (options.kv_id) {
      let kvServiceBindingPluginKvId = new Binding()
      kvServiceBindingPluginKvId.setText(options.kv_id)
      kvService.worker.setBindings(kvServiceBindingPluginKvId)
    }

    // Plugin external proxy service binding
    if (kvExternalService.name) {
      let kvServiceBindingPluginService = new Binding()
      kvServiceBindingPluginService.setService(kvExternalService.name)
      kvService.worker.setBindings(kvServiceBindingPluginService)
    }

    // instance.setService(kvService)

    // Plugin service to use service env.$x.get()
    let kvServiceBindingService = new Binding()
    kvServiceBindingService.setName(options.name)
    kvServiceBindingService.setKvNamespace(kvService.name)
    service.worker.setBindings(kvServiceBindingService)
  }
}
