import * as dockerNames from 'docker-names'
import fs from 'fs'
import { DevOptions } from '../../types'
import { WorkerdConfig } from '@c0b41/workerd-config'
import { Service, ServiceBindings } from '@c0b41/workerd-config/types/index'

export default (options: DevOptions) => {
  return (instance: WorkerdConfig) => {
    let compatibilityDate = '2023-03-21'

    let devServiceBindings: ServiceBindings[] = [
      {
        name: 'SERVICE_RELOAD',
        type: 'text',
        content: options.autoReload ? 'true' : 'false',
      },
      {
        name: 'SERVICE',
        service: 'xxx',
      },
    ]

    let moduleContent = fs.readFileSync('./dist/plugins/dev/index.esm.js', 'utf-8')

    let devService: Service = {
      name: `dev:[servicename]:${dockerNames.getRandomName()}`,
      worker: {
        compatibilityDate: compatibilityDate,
      },
    }

    // TODO: find service name, service socket and replace with dev service

    instance.Service(devService)
  }
}
