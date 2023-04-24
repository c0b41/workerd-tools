import { ModuleType } from '@types'
import ServiceModule from './module'

export default class WorkerModule extends ServiceModule {
  private _name: string
  private _type: ModuleType

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get type(): ModuleType {
    return this._type
  }

  setType(value: ModuleType) {
    this._type = value
  }
}
