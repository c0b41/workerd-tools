import childProcess from 'child_process'
import workerdPath from 'workerd'
import { Observer, waitForExit, pipeOutput } from './lib/utils'

export class devServer {
  #options: ServerOptions = {}
  #obs = null
  #process: childProcess.ChildProcess = null
  #processExitPromise: Promise<any> = null
  constructor(options: ServerOptions) {
    this.#options = options
    this.#obs = new Observer(this.#options.dist)

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

    console.log(`Workerd process started.`)
    const runtimeProcess = childProcess.spawn(command, args, {
      cwd: this.#options.pwd ?? process.cwd(),
      stdio: 'pipe',
    })
    this.#process = runtimeProcess
    this.#processExitPromise = waitForExit(runtimeProcess)
    pipeOutput(runtimeProcess)
  }

  #exitPromise() {
    return this.#processExitPromise
  }

  #dispose() {
    this.#process?.kill()
    return this.#processExitPromise
  }
}
