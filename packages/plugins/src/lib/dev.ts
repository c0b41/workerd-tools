import * as dockerNames from 'docker-names'
import fs from 'fs'
import { DevOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { IService, IServiceBindings } from '@c0b41/workerd-config/types/index'
import { Service } from '@c0b41/workerd-config/lib/nodes/index'

export default (options: DevOptions) => {
  return (instance: WorkerdConfig, service: Service) => {
    let compatibilityDate = '2023-03-21'

    let devServiceBindings: IServiceBindings[] = [
      {
        name: 'SERVICE_RELOAD',
        type: 'text',
        content: options.autoReload ? 'true' : 'false',
      },
      {
        name: 'WS_PORT',
        type: 'text',
        content: options.port ? options.port.toString() : '1337',
      },
      {
        name: 'SERVICE',
        service: service.name,
      },
    ]

    let moduleContent = fs.readFileSync('./dist/plugins/dev/index.esm.js', 'utf-8')

    let devService: IService = {
      name: `dev:${service.name}:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
        modules: [
          {
            name: 'dev-worker.js',
            type: 'esModule',
            content: moduleContent,
          },
        ],
        bindings: devServiceBindings,
      },
    }

    instance.Service(devService)

    // TODO: find service name, service socket and replace with dev service
  }
}
