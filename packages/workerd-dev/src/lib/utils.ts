import chokidar from 'chokidar'
import { EventEmitter } from 'events'
import rl from 'readline'

export class Observer extends EventEmitter {
  #dist: string
  #log: boolean
  constructor(dist, log) {
    super()
    this.#dist = dist
    this.#log = log
    this.#watchFile()
  }

  #message(message) {
    if (this.#log) {
      console.log(`[${new Date().toLocaleString()}] ${message}`)
    }
  }
  #watchFile() {
    try {
      this.#message(`Watching for file changes on: ${this.#dist}`)

      var watcher = chokidar.watch(this.#dist, {
        persistent: true,
        usePolling: true,
        ignoreInitial: false,
      })

      watcher.on('change', async (filePath) => {
        this.#message(`${filePath} has been updated.`)
        this.emit('restart', null)
      })

      watcher.on('error', (error) => this.#message(`Watcher error: ${error}`))
    } catch (error) {
      console.log(error)
    }
  }
}

export function waitForExit(process) {
  return new Promise((resolve) => {
    process.once('exit', () => resolve(null))
  })
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pipeOutput(runtime) {
  // TODO: may want to proxy these and prettify ✨
  // We can't just pipe() to `process.stdout/stderr` here, as Ink (used by
  // wrangler), only patches the `console.*` methods:
  // https://github.com/vadimdemedes/ink/blob/5d24ed8ada593a6c36ea5416f452158461e33ba5/readme.md#patchconsole
  // Writing directly to `process.stdout/stderr` would result in graphical
  // glitches.
  const stdout = rl.createInterface(runtime.stdout)
  const stderr = rl.createInterface(runtime.stderr)
  stdout.on('line', (data) => console.log(data))
  stderr.on('line', (data) => console.error(data))
  // runtime.stdout.pipe(process.stdout);
  // runtime.stderr.pipe(process.stderr);
}
