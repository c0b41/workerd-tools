import { WebSocketServer } from 'ws'
import { ProcessEvents } from './event'
import pino, { BaseLogger } from 'pino'

export class WebsocketServer {
  private server: WebSocketServer
  private logger: BaseLogger | null = null
  constructor() {
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: `websocket`,
    })

    ProcessEvents.on('exited', () => {
      this.close()
    })

    ProcessEvents.on('started', () => {
      this.initialize()
    })
  }

  private initialize() {
    this.server = new WebSocketServer({ port: 1336 })
    this.logger.info(`Auto Reload Websocket Server Ready`)
  }

  private reload() {
    for (const ws of this.server.clients) {
      ws.close(1012, 'Service Restart')
    }
  }

  private close() {
    this.server.close()
  }
}
