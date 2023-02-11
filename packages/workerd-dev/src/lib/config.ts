import { join } from 'path'
import { existsSync } from 'fs'
import { ConfigOutput, WorkerdConfig } from '@c0b41/workerd-config'
import { generateWorkerScript } from '@c0b41/workerd-config'
import { WorkersOptions } from '../../types'
import { Service } from '@c0b41/workerd-config/types/index'

export class Config {
  private path: string
  private instance: WorkerdConfig
  private workersOptions: WorkersOptions
  constructor(path: string, workerOptions: WorkersOptions) {
    this.path = path
    this.workersOptions = workerOptions

    this.initialize()
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
            serviceWorkerScript: generateWorkerScript('dev'),
            bindings: [
              {
                name: 'SERVICE',
                service: socket.service,
              },
            ],
          }

          if (this.workersOptions.autoReload) {
            service.worker.bindings.push({
              name: 'SERVICE_RELOAD',
              type: 'text',
              value: true,
            })
          }
          dev_services.push(service)
          socket.service = `dev:${socket.service}`
        }

        return socket
      })

      this.instance.dev_services = dev_services
    }
  }

  public getConfig(): Buffer {
    try {
      const configPath = join(process.cwd(), this.path)
      this.instance = require(configPath)
      this.generateDevServices()
      const output = new ConfigOutput(this.instance)
      return output.toBuffer()
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}
