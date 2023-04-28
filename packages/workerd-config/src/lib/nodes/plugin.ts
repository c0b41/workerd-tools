import { WorkerPluginCall } from '../../../types'

export default class Plugin {
  private _name: string
  private _call: WorkerPluginCall

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get create(): WorkerPluginCall {
    return this._call
  }

  setCall(value: WorkerPluginCall) {
    this._call = value
  }
}
