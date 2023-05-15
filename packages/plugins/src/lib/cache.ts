import { join } from 'path'
import * as dockerNames from 'docker-names'
import {
  External,
  Binding,
  Service,
  WorkerModule,
  WorkerdConfig,
  Http,
  Worker,
} from '@c0b41/workerd-config'

export interface CacheOptions {
  name: string
  cache_id: string
  API: {
    base: string
    path?: string
    token?: string
  }
}

export default (options: CacheOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let minCompatibilityDate = '2023-03-21'

    if (!options.name || !options.cache_id || !options.API?.base) {
      throw new Error('name, cache_id, API.base required!')
    }

    if (!service?.worker) {
      // only run for worker services
      return
    }

    //  TODO: check CacheApiOutbound is already exist?
    if (service.worker.cacheApiOutbound) {
      console.log(`Cache plugin already exist! `)
      return
    }

    // External Proxy service for internet access
    let cacheExternalService = new Service()
    cacheExternalService.setName(`external:cache:${service.name}`)
    let cacheExternal = new External()
    cacheExternal.setAddress(options.API.base)
    let externalHttp = new Http()
    externalHttp.setStyle(1)
    cacheExternal.setHttp(externalHttp)
    cacheExternalService.setExternal(cacheExternal)

    instance.setServices(cacheExternalService)

    // Workerd Api <=> Int Service api
    let cacheService = new Service()
    cacheService.setName(`int:cache:${service.name}:${dockerNames.getRandomName()}`)
    let cacheServiceWorker = new Worker()
    cacheServiceWorker.setcompatibilityDate(minCompatibilityDate)

    // Plugin modules
    let cacheExternalServiceModule = new WorkerModule()
    cacheExternalServiceModule.setName(`cache-worker.js`)
    cacheExternalServiceModule.setPath(join(__dirname, 'plugins/cache/index.esm.js'))
    cacheExternalServiceModule.setType('esModule')
    cacheServiceWorker.setModules(cacheExternalServiceModule)

    // Plugin service
    let cacheServiceBindingPlugin = new Binding()
    cacheServiceBindingPlugin.setName('PLUGIN')
    cacheServiceBindingPlugin.setText('cache')
    cacheServiceWorker.setBindings(cacheServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API?.path) {
      let cacheServiceBindingPluginPath = new Binding()
      cacheServiceBindingPluginPath.setName('PLUGIN_PATH')
      cacheServiceBindingPluginPath.setText(options.API.path)
      cacheServiceWorker.setBindings(cacheServiceBindingPluginPath)
    }

    // Plugin cache id binding
    if (options.cache_id) {
      let cacheServiceBindingPluginCacheId = new Binding()
      cacheServiceBindingPluginCacheId.setName('CACHE_ID')
      cacheServiceBindingPluginCacheId.setText(options.cache_id)
      cacheServiceWorker.setBindings(cacheServiceBindingPluginCacheId)
    }

    // Plugin external proxy service binding
    if (cacheExternalService.name) {
      let cacheServiceBindingPluginService = new Binding()
      cacheServiceBindingPluginService.setName('SERVICE')
      cacheServiceBindingPluginService.setService(cacheExternalService.name)
      cacheServiceWorker.setBindings(cacheServiceBindingPluginService)
    }

    cacheService.setWorker(cacheServiceWorker)
    instance.setServices(cacheService)
    // Plugin service to service connection env.$x.cache
    service.worker.setCacheApiOutbound(cacheService.name)
  }
}
