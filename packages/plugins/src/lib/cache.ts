import * as dockerNames from 'docker-names'
import fs from 'fs'
import { CacheOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { IService, IServiceBindings } from '@c0b41/workerd-config/types/index'
import { Service } from '@c0b41/workerd-config/lib/nodes/index'

export default (options: CacheOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    // External Proxy service for internet access
    let cacheExternalService: IService = {
      name: `external:cache:${service.name}`,
      external: {
        address: options.API.base,
      },
    }
    instance.Service(cacheExternalService)

    let cacheServiceBindings: IServiceBindings[] = [
      {
        name: 'PLUGIN',
        type: 'text',
        content: 'cache',
      },
      {
        name: 'PLUGIN_PATH',
        type: 'text',
        content: options.API.path,
      },
      {
        name: 'CACHE_ID',
        type: 'text',
        content: options.cache_id,
      },
      {
        name: 'SERVICE',
        service: cacheExternalService.name,
      },
    ]

    let moduleContent = fs.readFileSync('./dist/plugins/cache/index.esm.js', 'utf-8')

    // Workerd Api <=> Int Service api
    let cacheService: IService = {
      name: `int:cache:${service.name}:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
        modules: [
          {
            name: 'cache-worker.js',
            type: 'esModule',
            content: moduleContent,
          },
        ],
        bindings: cacheServiceBindings,
      },
    }

    instance.Service(cacheService)

    service.worker.setCacheApiOutbound(cacheService.name)
  }
}
