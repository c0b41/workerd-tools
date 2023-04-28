import DurableObjectStorage from './durable_object_storage'
import DurableObjectNamespace from './durable_object_namespaces'
import Module from './module'
import WorkerModule from './worker_module'
import Plugin from './plugin'
import { Binding } from './binding'
import { ObservedArray, observe } from '../utils'

export default class Worker {
  private _compatibilityDate: string
  private _compatibilityFlags = observe<string>([])
  private _serviceWorkerScript: Module
  private _modules = observe<WorkerModule>([])
  private _durableObjectUniqueKeyModifier: string
  private _cacheApiOutbound: string
  private _globalOutbound: string
  private _durableObjectNamespaces = observe<DurableObjectNamespace>([])
  private _durableObjectStorage: DurableObjectStorage
  private _bindings = observe<Binding>([])
  private _plugins = observe<Plugin>([])

  get compatibilityDate(): string {
    return this._compatibilityDate
  }

  setcompatibilityDate(value: string) {
    this._compatibilityDate = value
  }

  get compatibilityFlags(): ObservedArray<string> {
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

  get modules(): ObservedArray<WorkerModule> {
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

  get durableObjectNamespaces(): ObservedArray<DurableObjectNamespace> {
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

  get bindings(): ObservedArray<Binding> {
    return this._bindings
  }

  setBindings(value: Binding) {
    this._bindings.add(value)
  }

  get plugins(): ObservedArray<Plugin> {
    return this._plugins
  }

  setPlugins(value: Plugin) {
    this._plugins.add(value)
  }
}
