import { join } from 'path'
import { existsSync, writeFileSync } from 'fs'
import { ConfigOutput, WorkerdConfig } from '@c0b41/workerd-config'
import { WorkersOptions } from '../../types'
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
    let options = this.workersOptions
    // Todo: write with new plugins system
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
