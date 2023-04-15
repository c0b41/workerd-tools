import * as dockerNames from 'docker-names'
import fs from 'fs'
import { CacheOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { Service, ServiceBindings } from '@c0b41/workerd-config/types/index'

// todo: update with new api

export default (options: CacheOptions) => {
  return (instance: WorkerdConfig) => {
    let compatibilityDate = '2023-03-21'

    let cacheExternalService: Service = {
      name: `external:cache:[servicename]`,
      external: {
        address: options.API.base,
      },
    }

    instance.Service(cacheExternalService)

    let cacheServiceBindings: ServiceBindings[] = [
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

    let cacheService: Service = {
      name: `int:cache:[servicename]:${dockerNames.getRandomName()}`,
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

    return {
      cacheApiOutbound: cacheExternalService.name,
    }
  }
}
