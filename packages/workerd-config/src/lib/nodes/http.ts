import { IHttpHeaderInjectOptions } from '../../../types'

export default class Http {
  private _style: 'proxy' | 'host'
  private _injectRequestHeaders: Set<IHttpHeaderInjectOptions> = new Set()
  private _injectResponseHeaders: Set<IHttpHeaderInjectOptions> = new Set()
  constructor() {}

  get style() {
    return this._style
  }

  setStyle(value: 'proxy' | 'host') {
    this._style = value
  }

  get injectRequestHeaders(): Set<IHttpHeaderInjectOptions> {
    return this._injectRequestHeaders
  }

  setInjectRequestHeaders(value: IHttpHeaderInjectOptions) {
    this._injectRequestHeaders.add(value)
  }

  get injectResponseHeaders(): Set<IHttpHeaderInjectOptions> {
    return this._injectResponseHeaders
  }

  setInjectResponseHeaders(value: IHttpHeaderInjectOptions) {
    this._injectResponseHeaders.add(value)
  }
}
