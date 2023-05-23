import { ObservedArray, observe } from '../utils'
import TlsOptions from './tls'

export default class Network {
  private _allow = observe<string>([])
  private _deny = observe<string>([])
  private _tlsOptions: TlsOptions

  get allow(): ObservedArray<string> {
    return this._allow
  }

  setAllow(value: string) {
    this._allow.add(value)
  }

  get deny(): ObservedArray<string> {
    return this._deny
  }

  setDeny(value: string) {
    this._deny.add(value)
  }

  get tlsOptions(): TlsOptions {
    return this._tlsOptions
  }

  setTlsOptions(value: TlsOptions) {
    this._tlsOptions = value
  }
}
