import Http from './http'
import Https from './https'

export class SocketService {
  private _name: string
  private _entrypoint: string

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get entrypoint(): string {
    return this._entrypoint
  }

  setEntrypoint(value: string) {
    this._entrypoint = value
  }
}

export class Socket {
  private _name: string
  private _address: string
  private _http?: Http
  private _https?: Https
  private _service?: SocketService

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get address(): string {
    return this._address
  }

  setAddress(value: string) {
    this._address = value
  }

  get http(): Http {
    return this._http
  }

  setHttp(value: Http) {
    this._http = value
  }

  get https(): Https {
    return this._https
  }

  setHttps(value: Https) {
    this._https = value
  }

  get service(): SocketService {
    return this._service
  }

  setService(value: SocketService) {
    this._service = value
  }
}
