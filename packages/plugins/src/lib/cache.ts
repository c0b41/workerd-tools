import { join } from 'path'
import * as dockerNames from 'docker-names'
import { External, Binding, Service, WorkerModule, WorkerdConfig } from '@c0b41/workerd-config'

export interface CacheOptions {
  name: string
  cache_id: string
  API?: {
    base: string
    path?: string
    token?: string
  }
}

export default (options: CacheOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    //  TODO: check CacheApiOutbound is already exist?
    if(service.cacheApiOutbound){
      console.log(`Cache plugin already exist! `)
      return 
    }

    // External Proxy service for internet access
    let cacheExternalService = new Service()
    cacheExternalService.setName(`external:cache:${service.name}`)
    let external = new External()
    external.setAddress(options.API.base)
    cacheExternalService.setExternal(external)

    instance.setServices(cacheExternalService)

    // Workerd Api <=> Int Service api
    let cacheService = new Service()
    cacheService.setName(`int:cache:${service.name}:${dockerNames.getRandomName()}`)
    cacheService.worker.setcompatibilityDate(compatibilityDate)
    let cacheExternalServiceModule = new WorkerModule()

    // Plugin modules
    cacheExternalServiceModule.setName(`cache-worker.js`)
    cacheExternalServiceModule.setPath(join(__dirname, 'plugins/cache/index.esm.js'))
    cacheExternalServiceModule.setType('esModule')
    cacheService.worker.setModules(cacheExternalServiceModule)

    // Plugin service
    let cacheServiceBindingPlugin = new Binding()
    cacheServiceBindingPlugin.setName('PLUGIN')
    cacheServiceBindingPlugin.setText('cache')
    cacheService.worker.setBindings(cacheServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API?.base) {
      let cacheServiceBindingPluginPath = new Binding()
      cacheServiceBindingPluginPath.setName('PLUGIN_PATH')
      cacheServiceBindingPluginPath.setText(options.API.path)
      cacheService.worker.setBindings(cacheServiceBindingPluginPath)
    }

    // Plugin cache id binding
    if (options.cache_id) {
      let cacheServiceBindingPluginCacheId = new Binding()
      cacheServiceBindingPluginCacheId.setName('CACHE_ID')
      cacheServiceBindingPluginCacheId.setText(options.cache_id)
      cacheService.worker.setBindings(cacheServiceBindingPluginCacheId)
    }

    // Plugin external proxy service binding
    if (cacheExternalService.name) {
      let cacheServiceBindingPluginService = new Binding()
      cacheServiceBindingPluginService.setName('SERVICE')
      cacheServiceBindingPluginService.setService(cacheExternalService.name)
      cacheService.worker.setBindings(cacheServiceBindingPluginService)
    }

    instance.setServices(cacheService)
    // Plugin service to service connection env.$x.cache
    service.worker.setCacheApiOutbound(cacheService.name)
  }
}
