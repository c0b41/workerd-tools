import * as dockerNames from 'docker-names'
import { CacheOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { Binding, External, Service, WorkerModule } from '@c0b41/workerd-config/lib/nodes/index'

export default (options: CacheOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    // External Proxy service for internet access
    let cacheExternalService = new Service()
    cacheExternalService.setName(`external:cache:${service.name}`)
    let external = new External()
    external.setAddress(options.API.base)
    cacheExternalService.setExternal(external)

    // instance.setServices(cacheExternalService)

    // Workerd Api <=> Int Service api
    let cacheService = new Service()
    cacheService.setName(`int:cache:${service.name}:${dockerNames.getRandomName()}`)
    cacheService.worker.setcompatibilityDate(compatibilityDate)
    let cacheExternalServiceModule = new WorkerModule()

    // Plugin modules
    cacheExternalServiceModule.setName(`cache-worker.js`)
    cacheExternalServiceModule.setPath(`./dist/plugins/cache/index.esm.js`)
    cacheExternalServiceModule.setType('esModule')
    cacheService.worker.modules.setModules(cacheExternalServiceModule)

    // Plugin service
    let cacheServiceBindingPlugin = new Binding()
    cacheServiceBindingPlugin.setText('cache')
    cacheService.worker.setBindings(cacheServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API?.base) {
      let cacheServiceBindingPluginPath = new Binding()
      cacheServiceBindingPluginPath.setText(options.API.path)
      cacheService.worker.setBindings(cacheServiceBindingPluginPath)
    }

    // Plugin cache id binding
    if (options.cache_id) {
      let cacheServiceBindingPluginCacheId = new Binding()
      cacheServiceBindingPluginCacheId.setText(options.cache_id)
      cacheService.worker.setBindings(cacheServiceBindingPluginCacheId)
    }

    // Plugin external proxy service binding
    if (cacheExternalService.name) {
      let cacheServiceBindingPluginService = new Binding()
      cacheServiceBindingPluginService.setService(cacheExternalService.name)
      cacheService.worker.setBindings(cacheServiceBindingPluginService)
    }

    // instance.setService(cacheService)
    // Plugin service to service connection env.$x.cache
    service.worker.setCacheApiOutbound(cacheService.name)
  }
}
