import { join } from 'path'
import * as dockerNames from 'docker-names'
import {
  WorkerdConfig,
  Binding,
  External,
  Service,
  WorkerModule,
  Worker,
  Http,
} from '@c0b41/workerd-config'

export interface KvOptions {
  name: string
  kv_id: string
  API: {
    base: string
    path?: string
    token?: string
  }
}

export default (options: KvOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let minCompatibilityDate = '2023-05-12'

    if (!options.name || !options.kv_id || !options.API?.base) {
      throw new Error('name, kv_id, base required!')
    }

    if (!service?.worker) {
      // only run for worker services
      return
    }

    // External Proxy service for internet access
    let kvExternalService = new Service()
    kvExternalService.setName(`external:kv:${service.name}`)
    let externalService = new External()
    externalService.setAddress(options.API.base)
    let externalServiceHttp = new Http()
    externalServiceHttp.setStyle(1)
    externalService.setHttp(externalServiceHttp)
    kvExternalService.setExternal(externalService)

    instance.setServices(kvExternalService)

    // Workerd api <=> Int api service
    let kvService = new Service()
    kvService.setName(`int:kv:${service.name}:${dockerNames.getRandomName()}`)

    let kvServiceWorker = new Worker()
    kvServiceWorker.setcompatibilityDate(minCompatibilityDate)

    // Plugin modules
    let kvServiceModule = new WorkerModule()
    kvServiceModule.setName(`kv-worker.js`)
    kvServiceModule.setPath(join(__dirname, 'plugins/kv/index.esm.js'))
    kvServiceModule.setType(`esModule`)
    kvServiceWorker.setModules(kvServiceModule)

    let cacheServiceBindingPlugin = new Binding()
    cacheServiceBindingPlugin.setName('PLUGIN')
    cacheServiceBindingPlugin.setText('kv')
    kvServiceWorker.setBindings(cacheServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API?.path) {
      let kvServiceBindingPluginPath = new Binding()
      kvServiceBindingPluginPath.setName('PLUGIN_PATH')
      kvServiceBindingPluginPath.setText(options.API.path)
      kvServiceWorker.setBindings(kvServiceBindingPluginPath)
    }

    // Plugin kv id binding
    if (options.kv_id) {
      let kvServiceBindingPluginKvId = new Binding()
      kvServiceBindingPluginKvId.setName('NAMESPACE')
      kvServiceBindingPluginKvId.setText(options.kv_id)
      kvServiceWorker.setBindings(kvServiceBindingPluginKvId)
    }

    // Plugin external proxy service binding
    if (kvExternalService.name) {
      let kvServiceBindingPluginService = new Binding()
      kvServiceBindingPluginService.setName('SERVICE')
      kvServiceBindingPluginService.setService(kvExternalService.name)
      kvServiceWorker.setBindings(kvServiceBindingPluginService)
    }

    kvServiceWorker.setGlobalOutbound('internet')

    kvService.setWorker(kvServiceWorker)
    instance.setServices(kvService)

    // Plugin service to use service env.$x.get()
    let kvServiceBindingService = new Binding()
    kvServiceBindingService.setName(options.name)
    kvServiceBindingService.setKvNamespace(kvService.name)

    service.worker.setBindings(kvServiceBindingService)
  }
}
