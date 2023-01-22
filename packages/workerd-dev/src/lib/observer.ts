import chokidar from 'chokidar'
import { EventEmitter } from 'events'
import pino, { LoggerOptions } from 'pino'

export class Observer extends EventEmitter {
  private dist: string
  private logger: LoggerOptions | null = null
  constructor(dist) {
    super()
    this.dist = dist

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: `watch`,
    })

    this.watchFile()
  }

  private watchFile() {
    try {
      this.logger.info(`Watching for file changes on: ${this.dist}`)

      var watcher = chokidar.watch(this.dist, {
        persistent: true,
        usePolling: true,
        ignoreInitial: false,
      })

      watcher.on('change', async (filePath) => {
        this.logger.info(`${filePath} has been updated.`)
        this.emit('restart', null)
      })

      watcher.on('error', (error) => this.logger.error(`Watcher error: ${error}`))
    } catch (err) {
      this.logger.error(err)
    }
  }
}
