import DurableObjectStorage from './durable_object_storage'
import DurableObjectNamespace from './durable_object_namespaces'
import Module from './module'
import WorkerModule from './worker_module'
import { IBinding } from './binding'

export default class Worker {
  private _compatibilityDate: string
  private _compatibilityFlags: Set<string>
  private _serviceWorkerScript: Module
  private _modules: Set<WorkerModule>
  private _durableObjectUniqueKeyModifier: string
  private _cacheApiOutbound: string
  private _globalOutbound: string
  private _durableObjectNamespaces: Set<DurableObjectNamespace>
  private _durableObjectStorage: DurableObjectStorage
  private _bindings: Set<IBinding>

  get compatibilityDate(): string {
    return this._compatibilityDate
  }

  setcompatibilityDate(value: string) {
    this._compatibilityDate = value
  }

  get compatibilityFlags(): Set<string> {
    return this._compatibilityFlags
  }

  setcompatibilityFlags(value: string) {
    this._compatibilityFlags.add(value)
  }

  get serviceWorkerScript(): Module {
    return this._serviceWorkerScript
  }

  setServiceWorkerScript(value: Module) {
    this._serviceWorkerScript = value
  }

  get modules(): Set<WorkerModule> {
    return this._modules
  }

  setModules(value: WorkerModule) {
    this._modules.add(value)
  }

  get durableObjectUniqueKeyModifier(): string {
    return this._durableObjectUniqueKeyModifier
  }

  setDurableObjectUniqueKeyModifier(value: string) {
    this._durableObjectUniqueKeyModifier = value
  }

  get cacheApiOutbound(): string {
    return this._cacheApiOutbound
  }

  setCacheApiOutbound(value: string) {
    this._cacheApiOutbound = value
  }

  get globalOutbound(): string {
    return this._globalOutbound
  }

  setGlobalOutbound(value: string) {
    this._globalOutbound = value
  }

  get durableObjectNamespaces(): Set<DurableObjectNamespace> {
    return this._durableObjectNamespaces
  }

  setDurableObjectNamespaces(value: DurableObjectNamespace) {
    this._durableObjectNamespaces.add(value)
  }

  get durableObjectStorage(): DurableObjectStorage {
    return this._durableObjectStorage
  }

  setDurableObjectStorage(value: DurableObjectStorage) {
    this._durableObjectStorage = value
  }

  get bindings(): Set<IBinding> {
    return this._bindings
  }

  setBindings(value: IBinding) {
    this._bindings.add(value)
  }
}
