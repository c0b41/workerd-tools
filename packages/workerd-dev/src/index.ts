import childProcess from 'child_process'
import workerdPath from 'workerd'
import { Inspector } from './lib/inspector'
import { Observer, waitForExit, pipeOutput, sleep } from './lib/utils'

export class devServer {
  #options: ServerOptions = {}
  #obs = null
  #process: childProcess.ChildProcess = null
  #inspector: Inspector | null = null
  constructor(options: ServerOptions) {
    this.#options = options
    this.#obs = new Observer(this.#options.dist, false)

    this.#obs.on('restart', () => {
      this.#startProcess()
    })

    this.#startProcess()
  }

  #getCommand(): string[] {
    return [workerdPath, ...this.#getCommonArgs(), this.#options.config]
  }

  #getCommonArgs(): string[] {
    const args = [
      'serve',
      //"--external-addr=SERVICE_LOOPBACK=localhost:3030",
      // Required to use binary capnp config
      // "--binary",
      // Required to use compatibility flags without a default-on date,
      // (e.g. "streams_enable_constructors"), see https://github.com/cloudflare/workerd/pull/21
      '--experimental',
    ]
    if (this.#options.inspectorPort !== undefined) {
      // Required to enable the V8 inspector
      args.push(`--inspector-addr=localhost:${this.#options.inspectorPort}`)
    }
    if (this.#options.verbose) {
      args.push('--verbose')
    }
    return args
  }

  async #startProcess() {
    await this.#dispose()
    // 2. Start new process

    const [command, ...args] = this.#getCommand()

    const runtimeProcess = childProcess.spawn(command, args, {
      cwd: this.#options.pwd ?? process.cwd(),
      stdio: 'pipe',
    })
    this.#process = runtimeProcess
    await this.#pipeOut()
    await this.#cleanUp()
  }

  async #pipeOut() {
    console.log(`Workerd process started.`)
    if (this.#process && this.#options.logs.workerd) {
      pipeOutput(this.#process)
    }

    await sleep(3000)
    if (this.#options.inspector.port !== undefined && this.#options.logs.worker) {
      this.#inspector = new Inspector(this.#options.inspector)
    }
  }

  async #cleanUp() {
    await process.on('exit', async () => {
      await this.#dispose()
    })

    await process.on('uncaughtException', async () => {
      await this.#dispose()
    })
  }

  async #dispose() {
    if (this.#process) {
      this.#process.kill()
      this.#process = null
    }
    if (this.#inspector) {
      this.#inspector.close()
      this.#inspector = null
    }
  }
}
