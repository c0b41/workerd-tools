import { Inspector } from './lib/inspector'
import { Observer } from './lib/observer'
import { Runtime } from './lib/runtime'
import { ProcessEvents } from './lib/event'
import { Config } from './lib/config'

export class WorkerdDevServer {
  private options: ServerOptions = {}
  private observer: Observer | null = null
  private runtime: Runtime | null = null
  private config: Config | null = null
  constructor(options: ServerOptions) {
    this.options = options

    this.initialize()
  }

  private async initialize() {
    // Workerd process
    this.runtime = new Runtime(this.options.workerd, this.options.inspector)
    // File changes
    this.observer = new Observer(this.options.dist)
    //  Initialize workerd process
    await this.runtime.initialize()

    // Initialize workers inspectors
    if (this.options.inspector?.port && this.options.worker.logs) {
      new Inspector(this.options.inspector)
    }

    // TODO: websocket server for autoReload

    // For Config generation
    if (this.options.config) {
      this.config = new Config(this.options.config)
    }

    // Track file changes and update workerd config binary
    ProcessEvents.on('changes', () => {
      let buffer = this.config.getConfig()
      this.runtime.write(buffer)
    })
  }
}
