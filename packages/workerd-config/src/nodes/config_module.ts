import { Extension, ExtensionModule } from './extension'
import Service from './service'
import { Socket } from './socket'

export default class WorkerConfigModule {
  private _extensions: Extension
  private _services: Set<Service>
  private _sockets: Set<Socket>
  private _pre_services: Set<Service>
  private _dev_services: Set<Service>

  get extensions(): Extension {
    return this._extensions
  }

  setExtensions(value: ExtensionModule) {
    this._extensions.setModules(value)
  }

  get services(): Set<Service> {
    return this._services
  }

  setServices(value: Service) {
    this._services.add(value)
  }

  get sockets(): Set<Socket> {
    return this._sockets
  }

  setSockets(value: Socket) {
    this._sockets.add(value)
  }

  get preServices(): Set<Service> {
    return this._pre_services
  }

  setPreServices(value: Service) {
    this._pre_services.add(value)
  }

  get devServices(): Set<Service> {
    return this._dev_services
  }

  setDevServices(value: Service) {
    this._dev_services.add(value)
  }
}
