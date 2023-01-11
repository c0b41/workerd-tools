import { time } from 'console'
import type Protocol from 'devtools-protocol'
import WebSocket from 'ws'

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

function logConsoleMessage(evt: Protocol.Runtime.ConsoleAPICalledEvent): void {
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

  if (method in console) {
    switch (method) {
      case 'dir':
        console.dir(args)
        break
      case 'table':
        console.table(args)
        break
      default:
        // eslint-disable-next-line prefer-spread
        console[method].apply(console, args)
        break
    }
  } else {
    console.warn(`Unsupported console method: ${method}`)
    console.log('console event:', evt)
  }
}

export class Inspector {
  #ws: WebSocket[] = []
  #id: number = 1
  #options: InspectorOptions = {}
  constructor(options: InspectorOptions) {
    this.#options = options
    this.#preConnect()
  }

  async #preConnect() {
    // fetch worker list and connect them localhost:9229/json/list
    let workers = ['main', 'foo']
    // Filter out excludes worker names
    // this.#options.excludes

    console.log(workers)

    workers.forEach((worker) => {
      let socket = new WebSocket(`ws://localhost:${this.#options.port}/${worker}`)
      this.#ws.push(socket)
      this.#connect(socket)
      this.#events(socket)
    })
  }

  #connect(ws: WebSocket) {
    ws.addEventListener('open', () => {
      this.#send(ws, { method: 'Runtime.enable', id: this.#id })
      this.#send(ws, { method: 'Network.enable', id: this.#id++ })

      let keepAliveInterval: NodeJS.Timer = setInterval(() => {
        this.#send(ws, {
          method: 'Runtime.getIsolateId',
          id: this.#id++,
        })
      }, 10_000)
    })

    ws.on('unexpected-response', () => {
      console.log('Waiting for connection...')
      /**
       * This usually means the worker is not "ready" yet
       * so we'll just retry the connection process
       */
      //retryRemoteWebSocketConnection()
    })
  }
  #events(ws: WebSocket) {
    ws.addEventListener('message', async (event: MessageEvent) => {
      const evt = JSON.parse(event.data)
      switch (evt.method) {
        case 'Runtime.exceptionThrown':
          // errors stacks..
          break

        case 'Runtime.consoleAPICalled':
          logConsoleMessage(evt.params)
          break
        default:
          // others errors
          break
      }
    })
  }
  #isClosed(ws: WebSocket) {
    return ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING
  }
  #send(ws: WebSocket, event: Record<string, unknown>): void {
    if (!this.#isClosed(ws)) {
      ws.send(JSON.stringify(event))
    }
  }
  close() {
    this.#ws.forEach((ws) => {
      if (!this.#isClosed(ws)) {
        try {
          ws.removeAllListeners('open')
          ws.removeAllListeners('message')
          ws.removeAllListeners('close')
          ws.removeAllListeners('error')
          ws.terminate()
          ws.close()
        } catch (err) {}
      }
    })
  }
}
