import chokidar from 'chokidar'
import pino, { BaseLogger } from 'pino'
import { ProcessEvents } from './event'

export class Observer {
  private dist: string
  private logger: BaseLogger | null = null
  constructor(dist: string) {
    this.dist = dist

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: `watch`,
    })

    this.initialize()
  }

  private initialize() {
    try {
      this.logger.info(`Watching for file changes on: ${this.dist}`)

      var watcher = chokidar.watch(this.dist, {
        persistent: true,
        usePolling: true,
        ignoreInitial: false,
      })

      watcher.on('change', async (filePath) => {
        this.logger.info(`${filePath} has been updated.`)
        ProcessEvents.emit('changes', null)
      })

      watcher.on('error', (error) => this.logger.error(`Watcher error: ${error}`))
    } catch (err) {
      this.logger.error(err)
    }
  }
}
