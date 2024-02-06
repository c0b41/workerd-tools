import { Extension } from './extension'
import Service from './service'
import { Socket } from './socket'
import { ObservedArray, observe } from '../utils'
import { WorkerdConfigOptions } from '../../../types'

export default class WorkerConfigModule {
  private _options: WorkerdConfigOptions = {}
  private _extensions = observe<Extension>([])
  private _services = observe<Service>([])
  private _sockets = observe<Socket>([])

  get options(): WorkerdConfigOptions {
    return this._options
  }

  setOptions(value: WorkerdConfigOptions) {
    this._options = value
  }

  get extensions(): ObservedArray<Extension> {
    return this._extensions
  }

  setExtensions(value: Extension) {
    this._extensions.add(value)
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
}
