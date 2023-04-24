import * as dockerNames from 'docker-names'
import fs from 'fs'
import { KvOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { IService, IServiceBindings } from '@c0b41/workerd-config/types/index'
import { Binding, Service } from '@c0b41/workerd-config/lib/nodes/index'

export default (options: KvOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    // External Proxy service for internet access
    let kvExternalService: IService = {
      name: `external:kv:${service.name}`,
      external: {
        address: options.API.base,
      },
    }

    instance.Service(kvExternalService)

    let kvServiceBindings: IServiceBindings[] = [
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

    // Workerd api <=> Int api service
    let kvService: IService = {
      name: `int:kv:${service.name}:${dockerNames.getRandomName()}`,
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

    // Connect current service to kv service
    let kvBinding = new Binding()

    kvBinding.setName(options.name)
    kvBinding.setKvNamespace(kvService.name)
    service.worker.setBindings(kvBinding)
  }
}
