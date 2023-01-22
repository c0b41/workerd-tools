import rl from 'readline'
import pino from 'pino'

const errorReg =
  /(?<logpath>.*?)\s(?<level>.*?):(?<message>\s(.*?));\s(?<extra>.*)=\s(?<message2>.*?)\n/gm

const infoReg = /(?<path>(.*?)\d+):\s(?<level>.*?):\s(?<func>.*?;)(.*?\s=\s)(?<message>.*)/gm

export function waitForExit(process) {
  return new Promise((resolve) => {
    process.once('exit', () => resolve(null))
  })
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function pipeOutput(runtime) {
  const processLogger = pino({
    transport: {
      target: 'pino-pretty',
    },
    name: 'workerd',
  })
  const stdout = rl.createInterface(runtime.stdout)
  const stderr = rl.createInterface(runtime.stderr)
  stdout.on('line', (data) => {
    let matches = data.match(infoReg)
    console.log(data)
    //processLogger.info(matches)
  })
  stderr.on('line', (data) => {
    let matches = data.match(errorReg)
    console.log(data)
    //processLogger.error(matches)
  })
}
