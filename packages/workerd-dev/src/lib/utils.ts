import chokidar from 'chokidar'
import { EventEmitter } from 'events'
import rl from 'readline'

export class Observer extends EventEmitter {
  #dist: string
  constructor(dist) {
    super()
    this.#dist = dist
    this.#watchFile()
  }

  #watchFile() {
    try {
      console.log(`[${new Date().toLocaleString()}] Watching for file changes on: ${this.#dist}`)

      var watcher = chokidar.watch(this.#dist, {
        persistent: true,
        usePolling: true,
        ignoreInitial: false,
      })

      watcher.on('change', async (filePath) => {
        console.log(`[${new Date().toLocaleString()}] ${filePath} has been updated.`)

        // Get update content of file, in this case is one line

        // emit an event when the file has been updated
        this.emit('restart', null)
      })

      watcher.on('error', (error) => console.log(`Watcher error: ${error}`))
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
