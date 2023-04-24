import { IHttpHeaderInjectOptions, IHttpStyles } from '@types'
import { ObservedArray, observe } from '@utils'

export default class Http {
  private _style: IHttpStyles
  private _injectRequestHeaders = observe<IHttpHeaderInjectOptions>([])
  private _injectResponseHeaders = observe<IHttpHeaderInjectOptions>([])
  constructor() {}

  get style(): number {
    return this._style
  }

  setStyle(value: IHttpStyles) {
    this._style = value
  }

  get injectRequestHeaders(): ObservedArray<IHttpHeaderInjectOptions> {
    return this._injectRequestHeaders
  }

  setInjectRequestHeaders(value: IHttpHeaderInjectOptions) {
    this._injectRequestHeaders.add(value)
  }

  get injectResponseHeaders(): ObservedArray<IHttpHeaderInjectOptions> {
    return this._injectResponseHeaders
  }

  setInjectResponseHeaders(value: IHttpHeaderInjectOptions) {
    this._injectResponseHeaders.add(value)
  }
}
