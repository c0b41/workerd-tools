import Disk from './disk'
import External from './external'
import Network from './network'
import Worker from './worker'

export default class Service {
  private _name: string
  private _disk: Disk
  private _external: External
  private _network: Network
  private _worker: Worker

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get disk(): Disk {
    return this._disk
  }

  setDisk(value: Disk) {
    this._disk = value
  }

  get external(): External {
    return this._external
  }

  setExternal(value: External) {
    this._external = value
  }

  get network(): Network {
    return this._network
  }

  setNetwork(value: Network) {
    this._network = value
  }

  get worker(): Worker {
    return this._worker
  }

  setWorker(value: Worker) {
    this._worker = value
  }
}
