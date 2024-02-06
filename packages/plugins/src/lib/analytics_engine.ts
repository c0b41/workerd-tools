import * as dockerNames from 'docker-names'
import { join } from 'path'
import { External, Binding, Service, WorkerModule, WorkerdConfig, Http, Worker } from '@c0b41/workerd-config'

export interface AnalyticsEngineOptions {
  name: string
  dataset_id: string
  API: {
    base: string
    path?: string
    token?: string
  }
}

export default (options: AnalyticsEngineOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let minCompatibilityDate = '2023-12-18'

    if (!options.name || !options.dataset_id || !options.API?.base) {
      throw new Error('name, dataset_id, API.base required!')
    }

    if (!service?.worker) {
      // only run for worker services
      return
    }

    // External Proxy service for internet access
    let analyticsExternalService = new Service()
    analyticsExternalService.setName(`external:analytic_engine:${service.name}`)
    let analyticsExternal = new External()
    analyticsExternal.setAddress(options.API.base)
    let externalHttp = new Http()
    externalHttp.setStyle(1)
    analyticsExternal.setHttp(externalHttp)
    analyticsExternalService.setExternal(analyticsExternal)

    instance.setServices(analyticsExternalService)

    // Workerd Api <=> Int Service api
    let analyticsService = new Service()
    analyticsService.setName(`int:analytic_engine:${service.name}:${dockerNames.getRandomName()}`)
    let analyticsServiceWorker = new Worker()
    analyticsServiceWorker.setcompatibilityDate(minCompatibilityDate)

    // Plugin modules
    let cacheExternalServiceModule = new WorkerModule()
    cacheExternalServiceModule.setName(`analytic-engine-worker.js`)
    cacheExternalServiceModule.setPath(join(__dirname, 'plugins/analytics_engine/index.esm.js'))
    cacheExternalServiceModule.setType('esModule')
    analyticsServiceWorker.setModules(cacheExternalServiceModule)

    // Plugin service
    let analyticsServiceBindingPlugin = new Binding()
    analyticsServiceBindingPlugin.setName('PLUGIN')
    analyticsServiceBindingPlugin.setText('analytics-engine')
    analyticsServiceWorker.setBindings(analyticsServiceBindingPlugin)

    // Plugin path binding if exist
    if (options.API?.path) {
      let analyticsServiceBindingPluginPath = new Binding()
      analyticsServiceBindingPluginPath.setName('PLUGIN_PATH')
      analyticsServiceBindingPluginPath.setText(options.API.path)
      analyticsServiceWorker.setBindings(analyticsServiceBindingPluginPath)
    }

    // Plugin cache id binding
    if (options.dataset_id) {
      let analyticsServiceBindingPluginDatasetId = new Binding()
      analyticsServiceBindingPluginDatasetId.setName('DATASET_ID')
      analyticsServiceBindingPluginDatasetId.setText(options.dataset_id)
      analyticsServiceWorker.setBindings(analyticsServiceBindingPluginDatasetId)
    }

    // Plugin external proxy service binding
    if (analyticsExternalService.name) {
      let analyticsServiceBindingPluginService = new Binding()
      analyticsServiceBindingPluginService.setName('SERVICE')
      analyticsServiceBindingPluginService.setService(analyticsExternalService.name)
      analyticsServiceWorker.setBindings(analyticsServiceBindingPluginService)
    }

    analyticsService.setWorker(analyticsServiceWorker)
    instance.setServices(analyticsService)

    let analyticsServiceBindingService = new Binding()
    analyticsServiceBindingService.setName(options.name)
    analyticsServiceBindingService.setAnalyticsEngine(analyticsService.name)
    service.worker.setBindings(analyticsServiceBindingService)
  }
}
