import Http from './http'
import ServiceModule from './module'
import TlsOptions from './tls'

export default class Https {
  private _httpOptions: Http
  private _tlsOptions: TlsOptions

  get httpOptions(): Http {
    return this._httpOptions
  }

  setHttpOptions(value: Http) {
    this._httpOptions = value
  }

  get tlsOptions(): TlsOptions {
    return this._tlsOptions
  }

  setTlsOptions(value: TlsOptions) {
    this._tlsOptions = value
  }
}
