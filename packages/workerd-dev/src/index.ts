import childProcess from 'child_process'
import { join } from 'path'
import workerdPath from 'workerd'
import { ConfigOutput } from '@c0b41/workerd-config'
import { Inspector } from './lib/inspector'
import { Observer } from './lib/observer'
import { waitForExit, pipeOutput, sleep } from './lib/utils'
import { ProcessEvents } from './lib/event'

export class WorkerdDevServer {
  private options: ServerOptions = {}
  private obs = null
  private process: childProcess.ChildProcess = null
  private inspector: Inspector | null = null
  constructor(options: ServerOptions) {
    this.options = options
    this.obs = new Observer(this.options.dist)

    ProcessEvents.on('restart', () => {
      this.updateConfig()
    })

    this.startProcess()
  }

  private getCommand(): string[] {
    let bin = this.options.workerd.bin ?? workerdPath
    return [bin, ...this.getCommonArgs()]
  }

  private getCommonArgs(): string[] {
    let args = [
      'serve',
      '--binary', // Required to use binary capnp config
      //'--watch', // Reload to process
      '--experimental',
    ]
    if (this.options.inspector.port !== undefined) {
      args.push(`--inspector-addr=localhost:${this.options.inspector.port}`)
    }
    if (this.options.workerd.verbose) {
      args.push('--verbose')
    }

    if (this.options.workerd.args) {
      this.options.workerd.args.forEach((arg) => {
        args.push(arg)
      })
    }
    return args
  }

  private async startProcess() {
    //await this.dispose()
    // 2. Start new process
    //const [command, ...args] = this.getCommand()
    //const runtimeProcess = childProcess.spawn(command, args, {
    //  cwd: this.options.workerd.pwd ?? process.cwd(),
    //  stdio: 'pipe',
    //})
    //this.process = runtimeProcess
    await this.updateConfig()
    //await this.pipeOut()
    //await this.cleanUp()
  }

  private async updateConfig() {
    try {
      const configPath = join(process.cwd(), this.options.config)
      const configInstance = require(configPath)
      // TODO: extend dev services
      const output = new ConfigOutput(configInstance)
      //this.process.stdin.write(output.toBuffer())
      //this.process.stdin.end()
    } catch (error) {
      console.log(error)
      //this.dispose()
      //process.exit(1)
    }
  }

  private async pipeOut() {
    if (this.process && this.options.workerd.logs) {
      pipeOutput(this.process)
    }

    await sleep(3000)
    if (this.options.inspector.port !== undefined && this.options.worker.logs) {
      this.inspector = new Inspector(this.options.inspector)
    }
  }

  private async cleanUp() {
    waitForExit(this.process)
  }

  private async dispose() {
    if (this.process) {
      this.process.kill('SIGINT')
      this.process = null
    }
    if (this.inspector) {
      this.inspector.closeAll()
      this.inspector = null
    }
  }
}
