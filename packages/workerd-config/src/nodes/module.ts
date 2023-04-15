import { readFileSync } from 'fs'

export default class ServiceModule {
  private _path: string
  private _content: Uint8Array | string

  get path(): string {
    return this._path
  }

  setPath(value: string) {
    this._path = value
  }

  get content(): Uint8Array | string {
    if (this._content) {
      return this._content
    }

    if (this._path) {
      this._content = this.readFile(this._path)
      return this._content
    }
  }

  setContent(value: Uint8Array | string) {
    this._content = value
  }

  private readFile(path: string) {
    try {
      return readFileSync(path, 'utf-8')
    } catch (error) {
      throw new Error(`${path} doesn't exist or failed read`)
    }
  }
}
