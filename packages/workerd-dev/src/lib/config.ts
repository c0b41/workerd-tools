import { join } from 'path'
import { existsSync } from 'fs'
import { ConfigOutput, WorkerdConfig } from '@c0b41/workerd-config'

export class Config {
  private path: string
  private instance: WorkerdConfig
  constructor(path: string) {
    this.path = path

    this.initialize()
  }

  private initialize() {
    const configPath = join(process.cwd(), this.path)

    if (!existsSync(configPath)) {
      throw new Error(`Config file does not exist ${configPath}`)
    }
  }

  private generateDevServices() {
    // this.instance
    // TODO: generate autoReload and prettyErrors services
  }

  public getConfig(): Buffer {
    try {
      const configPath = join(process.cwd(), this.path)
      this.instance = require(configPath)
      // TODO: extend dev services
      // this.generateDevServices()
      const output = new ConfigOutput(this.instance)
      return output.toBuffer()
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }
}
