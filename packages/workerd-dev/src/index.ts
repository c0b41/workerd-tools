import childProcess from 'child_process'
import workerdPath from 'workerd'
import { Inspector } from './lib/inspector'
import { Observer } from './lib/observer'
import { waitForExit, pipeOutput, sleep } from './lib/utils'

export class devServer {
  private options: ServerOptions = {
    logs: {
      workerd: false,
      worker: false,
    },
  }
  private obs = null
  private process: childProcess.ChildProcess = null
  private inspector: Inspector | null = null
  constructor(options: ServerOptions) {
    this.options = options
    this.options.bin = this.options.bin ? this.options.bin : workerdPath
    this.obs = new Observer(this.options.dist)

    this.obs.on('restart', () => {
      this.startProcess()
    })

    this.startProcess()
  }

  private getCommand(): string[] {
    return [this.options.bin, ...this.getCommonArgs(), this.options.config]
  }

  private getCommonArgs(): string[] {
    const args = [
      'serve',
      //"--external-addr=SERVICE_LOOPBACK=localhost:3030",
      // Required to use binary capnp config
      // "--binary",
      // Required to use compatibility flags without a default-on date,
      // (e.g. "streams_enable_constructors"), see https://github.com/cloudflare/workerd/pull/21
      '--experimental',
    ]
    if (this.options.inspector.port !== undefined) {
      // Required to enable the V8 inspector
      args.push(`--inspector-addr=localhost:${this.options.inspector.port}`)
    }
    if (this.options.verbose) {
      args.push('--verbose')
    }
    return args
  }

  private async startProcess() {
    await this.dispose()
    // 2. Start new process

    const [command, ...args] = this.getCommand()

    const runtimeProcess = childProcess.spawn(command, args, {
      cwd: this.options.pwd ?? process.cwd(),
      stdio: 'pipe',
    })
    this.process = runtimeProcess
    await this.pipeOut()
    await this.cleanUp()
  }

  private async pipeOut() {
    if (this.process && this.options.logs.workerd) {
      pipeOutput(this.process)
    }

    await sleep(3000)
    if (this.options.inspector.port !== undefined && this.options.logs.worker) {
      this.inspector = new Inspector(this.options.inspector)
    }
  }

  private async cleanUp() {
    waitForExit(this.process)
  }

  private async dispose() {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
    if (this.inspector) {
      this.inspector.closeAll()
      this.inspector = null
    }
  }
}
