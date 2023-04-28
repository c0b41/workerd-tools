import { ObservedArray, observe } from '../utils'

export default class Network {
  private _allow = observe<string>([])
  private _deny = observe<string>([])

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
}
