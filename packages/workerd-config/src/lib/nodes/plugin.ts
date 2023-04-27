export default class Plugin {
  private _name: string
  private _call: Function

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get create(): Function {
    return this._call
  }

  setCall(value: Function) {
    this._call = value
  }
}
