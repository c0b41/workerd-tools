import { IHttpHeaderInjectOptions, IHttpStyles } from '../../../types'

export default class Http {
  private _style: IHttpStyles
  private _injectRequestHeaders: Set<IHttpHeaderInjectOptions> = new Set()
  private _injectResponseHeaders: Set<IHttpHeaderInjectOptions> = new Set()
  constructor() {}

  get style(): number {
    return this._style
  }

  setStyle(value: IHttpStyles) {
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
