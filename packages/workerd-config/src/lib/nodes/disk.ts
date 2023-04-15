export default class Disk {
  private _writables: boolean
  private _allowDotfiles: boolean
  private _path: string

  get writable(): boolean {
    return this._writables
  }

  setWritable(value: boolean) {
    this._writables = value
  }

  get allowDotfiles(): boolean {
    return this._allowDotfiles
  }

  setAllowDotfiles(value: boolean) {
    this._allowDotfiles = value
  }

  get path(): string {
    return this._path
  }

  setPath(value: string) {
    this._path = value
  }
}
