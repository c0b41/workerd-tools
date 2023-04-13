import * as dockerNames from 'docker-names'
import fs from 'fs'
import { KvOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { Service, ServiceBindings } from '@c0b41/workerd-config/types/index'

export default (options: KvOptions) => {
  return (instance: WorkerdConfig) => {
    let compatibilityDate = '2023-03-21'

    let kvExternalService: Service = {
      name: `external:kv:[servicename]`,
      external: {
        address: options.API.base,
      },
    }

    instance.Service(kvExternalService)

    let kvServiceBindings: ServiceBindings[] = [
      {
        name: 'PLUGIN',
        type: 'text',
        content: 'kv',
      },
      {
        name: 'PLUGIN_PATH',
        type: 'text',
        content: options.API.path,
      },
      {
        name: 'NAMESPACE',
        type: 'text',
        content: options.kv_id,
      },
      {
        name: 'SERVICE',
        service: kvExternalService.name,
      },
    ]

    let moduleContent = fs.readFileSync('./dist/plugins/kv/index.esm.js', 'utf-8')

    let kvService: Service = {
      name: `int:kv:[servicename]:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
        modules: [
          {
            name: 'kv-worker.js',
            type: 'esModule',
            content: moduleContent,
          },
        ],
        bindings: kvServiceBindings,
      },
    }

    instance.Service(kvService)

    let serviceBindings: ServiceBindings[] = [
      {
        name: options.name,
        kvNamespace: kvService.name,
      },
    ]

    return {
      bindings: serviceBindings,
    }
  }
}
