import childProcess from 'child_process'
import pino, { BaseLogger } from 'pino'
import rl from 'readline'
import workerdPath from 'workerd'
import { InspectorOptions, WorkerdOptions } from '../../types'
import { ProcessEvents } from './event'

//const errorReg = /(?<logpath>.*?)\s(?<level>.*?):(?<message>\s(.*?));\s(?<extra>.*)=\s(?<message2>.*?)\n/gm
//const infoReg = /(?<path>(.*?)\d+):\s(?<level>.*?):\s(?<func>.*?;)(.*?\s=\s)(?<message>.*)/gm

export class Runtime {
  public process: childProcess.ChildProcess = null
  private bin: string
  private args: string[] = [
    'serve',
    '--binary', // Required to use binary capnp config
    '--experimental',
    '--watch',
  ]
  private options: WorkerdOptions
  private inspector: InspectorOptions
  private logger: BaseLogger
  constructor(options: WorkerdOptions, inspector: InspectorOptions) {
    this.options = options
    this.inspector = inspector
    this.bin = this.options.bin ?? workerdPath

    this.logger = pino({
      transport: {
        target: 'pino-pretty',
      },
      name: 'workerd',
    })

    ProcessEvents.on('config', (buffer) => {
      this.write(buffer)
    })

    ProcessEvents.on('reload', async () => {
      await this.initialize()
    })
  }

  public setArgs(args: string[]) {
    this.args = args
  }

  public async initialize() {
    await this.dispose()

    const command = this.getCommand()
    const args = this.getCommonArgs()
    this.logger.info(`Workerd process arguments.. ${command} ${args.join(' ')}`)
    const runtimeProcess = childProcess.spawn(command, args, {
      cwd: this.options.pwd ?? process.cwd(),
      stdio: 'pipe',
    })
    this.process = runtimeProcess

    this.pipeOut()
    this.cleanUp()

    ProcessEvents.emit('started')
  }

  public write(message: Buffer) {
    if (this.process) {
      this.logger.info('Buffer writed to workerd process')
      this.process.stdin.write(message)
      this.process.stdin.end()
    }
  }

  private getCommonArgs(): string[] {
    let args = [...this.args]
    if (this.inspector?.port !== undefined) {
      args.push(`--inspector-addr=localhost:${this.inspector.port}`)
    }
    if (this.options.verbose) {
      args.push('--verbose')
    }

    if (this.options.args) {
      this.options.args.forEach((arg) => {
        args.push(arg)
      })
    }

    args.push('-')
    return args
  }

  public setBin(bin: String) {
    this.bin = bin as string
  }

  private getCommand(): string {
    return this.bin
  }

  private pipeOut() {
    if (this.process && this.options.logs) {
      this.logger.info('Workerd process started')
      const stdout = rl.createInterface(this.process.stdout)
      const stderr = rl.createInterface(this.process.stderr)
      stdout.on('line', (data) => {
        //let matches = data.match(infoReg)
        console.log(data)
        //this.logger.info(matches)
      })
      stderr.on('line', (data) => {
        //let matches = data.match(errorReg)
        console.log(data)
        //this.logger.error(matches)
      })
    }
  }

  private async cleanUp() {
    this.process.once('exit', () => {
      ProcessEvents.emit('exited')
    })
  }

  private async dispose() {
    if (this.process) {
      ProcessEvents.emit('exited')
      this.process.kill('SIGINT')
      this.process = null
    }
  }
}
