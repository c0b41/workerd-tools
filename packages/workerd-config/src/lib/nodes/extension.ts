import ServiceModule from './module'
import { ObservedArray, observe } from '../utils'

export class ExtensionModule extends ServiceModule {
  private _name: string
  private _internal: boolean

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get internal(): boolean {
    return this._internal
  }

  setInternal(value: boolean) {
    this._internal = value
  }
}

export class Extension {
  private _modules = observe<ExtensionModule>([])

  get modules(): ObservedArray<ExtensionModule> {
    return this._modules
  }

  setModules(value: ExtensionModule) {
    this._modules.add(value)
  }
}
