export default class Network {
  private _allow: Set<string>
  private _deny: Set<string>

  get allow(): Set<string> {
    return this._allow
  }

  setAllow(value: string) {
    this._allow.add(value)
  }

  get deny(): Set<string> {
    return this._deny
  }

  setDeny(value: string) {
    this._deny.add(value)
  }
}
