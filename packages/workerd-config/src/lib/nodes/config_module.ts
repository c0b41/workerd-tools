import { Extension, ExtensionModule } from './extension'
import Service from './service'
import { Socket } from './socket'
import { ObservedArray, observe } from '@utils'

export default class WorkerConfigModule {
  private _extensions: Extension
  private _services = observe<Service>([])
  private _sockets = observe<Socket>([])
  private _pre_services = observe<Service>([])
  private _dev_services = observe<Service>([])

  get extensions(): Extension {
    return this._extensions
  }

  setExtensions(value: ExtensionModule) {
    this._extensions.setModules(value)
  }

  get services(): ObservedArray<Service> {
    return this._services
  }

  setServices(value: Service) {
    this._services.add(value)
  }

  get sockets(): ObservedArray<Socket> {
    return this._sockets
  }

  setSockets(value: Socket) {
    this._sockets.add(value)
  }

  get preServices(): ObservedArray<Service> {
    return this._pre_services
  }

  setPreServices(value: Service) {
    this._pre_services.add(value)
  }

  get devServices(): ObservedArray<Service> {
    return this._dev_services
  }

  setDevServices(value: Service) {
    this._dev_services.add(value)
  }
}
