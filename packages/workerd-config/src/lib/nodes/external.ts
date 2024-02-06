import Http from './http'
import Https from './https'
import Tcp from './tcp'

export default class External {
  private _address: string
  private _http?: Http
  private _https?: Https
  private _tcp?: Tcp

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

  get tcp(): Tcp {
    return this._tcp
  }

  setTcp(value: Https) {
    this._tcp = value
  }
}
