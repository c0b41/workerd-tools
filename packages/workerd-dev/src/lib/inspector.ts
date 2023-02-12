import type Protocol from 'devtools-protocol'
import WebSocket from 'ws'
import pino, { BaseLogger } from 'pino'
import got from 'got'
import { ProcessEvents } from './event'
import { sleep } from '../lib/utils'
import { InspectorOptions, InspectorSocketOptions } from '../../types'

export const mapConsoleAPIMessageTypeToConsoleMethod: {
  [key in Protocol.Runtime.ConsoleAPICalledEvent['type']]: Exclude<keyof Console, 'Console'>
} = {
  log: 'log',
  debug: 'debug',
  info: 'info',
  warning: 'warn',
  error: 'error',
  dir: 'dir',
  dirxml: 'dirxml',
  table: 'table',
  trace: 'trace',
  clear: 'clear',
  count: 'count',
  assert: 'assert',
  profile: 'profile',
  profileEnd: 'profileEnd',
  timeEnd: 'timeEnd',
  startGroup: 'group',
  startGroupCollapsed: 'groupCollapsed',
  endGroup: 'groupEnd',
}

function logConsoleMessage(evt: Protocol.Runtime.ConsoleAPICalledEvent) {
  const args: string[] = []
  for (const ro of evt.args) {
    switch (ro.type) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
      case 'symbol':
      case 'bigint':
        args.push(ro.value)
        break
      case 'function':
        args.push(`[Function: ${ro.description ?? '<no-description>'}]`)
        break
      case 'object':
        if (!ro.preview) {
          args.push(ro.subtype === 'null' ? 'null' : ro.description ?? '<no-description>')
        } else {
          args.push(ro.preview.description ?? '<no-description>')

          switch (ro.preview.subtype) {
            case 'array':
              args.push(
                '[ ' +
                  ro.preview.properties
                    .map(({ value }) => {
                      return value
                    })
                    .join(', ') +
                  (ro.preview.overflow ? '...' : '') +
                  ' ]'
              )

              break
            case 'weakmap':
            case 'map':
              ro.preview.entries === undefined
                ? args.push('{}')
                : args.push(
                    '{\n' +
                      ro.preview.entries
                        .map(({ key, value }) => {
                          return `  ${key?.description ?? '<unknown>'} => ${value.description}`
                        })
                        .join(',\n') +
                      (ro.preview.overflow ? '\n  ...' : '') +
                      '\n}'
                  )

              break
            case 'weakset':
            case 'set':
              ro.preview.entries === undefined
                ? args.push('{}')
                : args.push(
                    '{ ' +
                      ro.preview.entries
                        .map(({ value }) => {
                          return `${value.description}`
                        })
                        .join(', ') +
                      (ro.preview.overflow ? ', ...' : '') +
                      ' }'
                  )
              break
            case 'regexp':
              break
            case 'date':
              break
            case 'generator':
              args.push(ro.preview.properties[0].value || '')
              break
            case 'promise':
              if (ro.preview.properties[0].value === 'pending') {
                args.push(`{<${ro.preview.properties[0].value}>}`)
              } else {
                args.push(
                  `{<${ro.preview.properties[0].value}>: ${ro.preview.properties[1].value}}`
                )
              }
              break
            case 'node':
            case 'iterator':
            case 'proxy':
            case 'typedarray':
            case 'arraybuffer':
            case 'dataview':
            case 'webassemblymemory':
            case 'wasmvalue':
              break
            case 'error':
            default:
              // just a pojo
              args.push(
                '{\n' +
                  ro.preview.properties
                    .map(({ name, value }) => {
                      return `  ${name}: ${value}`
                    })
                    .join(',\n') +
                  (ro.preview.overflow ? '\n  ...' : '') +
                  '\n}'
              )
          }
        }
        break
      default:
        args.push(ro.description || ro.unserializableValue || '🦋')
        break
    }
  }

  const method = mapConsoleAPIMessageTypeToConsoleMethod[evt.type]

  //if (method in console) {
  //  switch (method) {
  //    case 'dir':
  //      console.dir(args)
  //      break
  //    case 'table':
  //      console.table(args)
  //      break
  //    default:
  //      // eslint-disable-next-line prefer-spread
  //      console[method].apply(console, args)
  //      break
  //  }
  //} else {
  //  console.warn(`Unsupported console method: ${method}`)
  //  console.log('console event:', evt)
  //}

  return args
}

export class Inspector {
  private sockets: WebSocket[] = []
  private options: InspectorOptions = {}
  private logger: BaseLogger | null = null
  constructor(options: InspectorOptions) {
    this.options = options

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: `inspector`,
    })

    ProcessEvents.on('exited', () => {
      this.closeAll()
    })

    ProcessEvents.on('started', () => {
      this.initialize().then(() => {
        this.logger.info('Inspector connection started')
      })
    })
  }

  private async initialize() {
    this.closeAll()
    await sleep(3000)
    let workers = await this.fetchActiveWorkers()

    this.sockets = workers.map((worker: string) => {
      return new InspectorSocket({
        name: worker,
        port: this.options.port,
      })
    })
  }

  private async fetchActiveWorkers() {
    let workers = new Set()
    let defaultExclude = /(dev:|loop:)/
    try {
      let response = await got(`http://localhost:${this.options.port}/json/list`)
      if (response.body) {
        let list = JSON.parse(response.body)

        list.forEach((worker: { id: string }) => {
          if (
            !workers.has(worker.id) &&
            (!new RegExp(defaultExclude).test(worker.id) ||
              !new RegExp(this.options.excludes).test(worker.id))
          ) {
            workers.add(worker.id)
          }
        })
      }
    } catch (error) {
      console.log(`Activer Worker list failed`)
    } finally {
      return Array.from(workers)
    }
  }

  closeAll() {
    this.sockets.forEach((socket) => {
      socket.close()
    })

    this.sockets = []
  }
}

class InspectorSocket {
  private ws: WebSocket | null = null
  private port: number | null = null
  private name: string | null = null
  private logger: BaseLogger | null = null
  constructor(options: InspectorSocketOptions) {
    this.name = options.name
    this.port = options.port
    this.ws = new WebSocket(`ws://localhost:${options.port}/${options.name}`)
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: `worker:${options.name}`,
    })
    this.connect()
  }

  private connect() {
    let id = 0
    let keepAliveInterval: NodeJS.Timer = null
    this.ws.addEventListener('open', () => {
      this.send({ method: 'Runtime.enable', id: id++ })
      this.send({ method: 'Network.enable', id: id++ })

      keepAliveInterval = setInterval(() => {
        this.send({
          method: 'Runtime.getIsolateId',
          id: id++,
        })
      }, 10_000)
      this.logger.info(`${this.name} Inspector connected.`)
      this.events()
    })

    this.ws.on('unexpected-response', () => {
      this.logger.info('Waiting for connection...')
      /**
       * This usually means the worker is not "ready" yet
       * so we'll just retry the connection process
       */
      //retryRemoteWebSocketConnection()
    })

    this.ws.addEventListener('close', () => {
      clearInterval(keepAliveInterval)
    })
  }

  private events() {
    this.ws.addEventListener('message', async (event: MessageEvent) => {
      const evt = JSON.parse(event.data)
      switch (evt.method) {
        case 'Runtime.exceptionThrown':
          // errors stacks..
          break

        case 'Runtime.consoleAPICalled':
          this.logger.info(logConsoleMessage(evt.params))
          break
        default:
          // others errors
          break
      }
    })
  }

  public close() {
    if (!this.isClosed()) {
      try {
        this.ws.removeAllListeners('open')
        this.ws.removeAllListeners('message')
        this.ws.removeAllListeners('close')
        this.ws.removeAllListeners('error')
        this.ws.terminate()
        this.ws.close()
      } catch (err) {}
    }
  }

  private send(event: Record<string, unknown>): void {
    if (!this.isClosed()) {
      this.ws.send(JSON.stringify(event))
    }
  }

  private isClosed() {
    return this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING
  }
}
