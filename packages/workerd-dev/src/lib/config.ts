import { join } from 'path'
import { existsSync, writeFileSync } from 'fs'
import { ConfigOutput, WorkerdConfig } from '@c0b41/workerd-config'
import { generateWorkerScript } from '@c0b41/workerd-config'
import { WorkersOptions } from '../../types'
import { Service } from '@c0b41/workerd-config/types/index'
import { ProcessEvents } from './event'
import { requireUncached } from './utils'

export class Config {
  private path: string
  private instance: WorkerdConfig
  private workersOptions: WorkersOptions
  constructor(path: string, workerOptions: WorkersOptions) {
    this.path = path
    this.workersOptions = workerOptions

    this.initialize()

    ProcessEvents.on('started', () => {
      let buffer = this.getConfig()
      ProcessEvents.emit('config', buffer)
    })
  }

  private initialize() {
    const configPath = join(process.cwd(), this.path)

    if (!existsSync(configPath)) {
      throw new Error(`Config file does not exist ${configPath}`)
    }
  }

  private generateDevServices() {
    if (this.workersOptions.prettyErrors) {
      let dev_services = []
      this.instance.sockets = this.instance.sockets.map((socket) => {
        if (socket.address && socket.service) {
          let service: Service = {
            name: `dev:${socket.service}`,
          }
          service.worker = {
            serviceWorkerScript: {
              content: generateWorkerScript('dev'),
            },
            compatibilityDate: '2022-09-16',
            bindings: [
              {
                name: 'SERVICE',
                service: socket.service.name,
              },
            ],
          }

          service.worker.bindings.push({
            name: 'SERVICE_RELOAD',
            type: 'text',
            content: this.workersOptions.autoReload ? 'true' : 'false',
          })
          dev_services.push(service)
          socket.service = {
            name: `dev:${socket.service}`,
          }
        }

        return socket
      })

      this.instance.dev_services = dev_services
    }
  }

  private generateConfig() {
    const configPath = join(process.cwd(), this.path)
    try {
      this.instance = requireUncached(configPath)
      this.generateDevServices()
    } catch (error) {
      throw new Error(`${configPath} does not exist`)
    }
  }

  public getConfig(): Buffer {
    try {
      this.generateConfig()
      const output = new ConfigOutput(this.instance)
      this.instance = null
      return output.toBuffer()
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}
