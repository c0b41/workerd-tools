export default class DurableObjectNamespace {
  private _className: string
  private _uniqueKey: string

  get className(): string {
    return this._className
  }

  setClassName(value: string) {
    this._className = value
  }

  get uniqueKey(): string {
    return this._uniqueKey
  }

  setUniqueKey(value: string) {
    this._uniqueKey = value
  }
}
