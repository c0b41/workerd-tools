import * as fs from 'fs'
import { WorkerdConfig } from '.'
import { serializeConfig } from './config'
import preConfig from './pre'

export default class ConfigOutput {
  private config: WorkerdConfig | null
  constructor(config: WorkerdConfig) {
    this.config = config
  }

  private generate(): Buffer {
    let buffer = serializeConfig(preConfig)
    return buffer
  }

  toBuffer(): Buffer {
    return this.generate()
  }

  toJson(): toJson {
    return {
      services: [...this.config.services, ...this.config.pre_services],
      sockets: [...this.config.sockets],
    }
  }
}
