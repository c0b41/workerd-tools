import { readFileSync } from 'fs'

export default class ServiceModule {
  private _path: string
  private _content: string

  get path(): string {
    return this._path
  }

  setPath(value: string) {
    this._path = value
  }

  get content(): string {
    if (this._content) {
      return this._content
    }

    if (this._path) {
      this._content = this.readFile(this._path)
      return this._content
    }
  }

  setContent(value: string) {
    this._content = value
  }

  get toUint8Array(): Uint8Array {
    return new TextEncoder().encode(this._content)
  }

  private readFile(path: string): string {
    try {
      return readFileSync(path, 'utf-8')
    } catch (error) {
      throw new Error(`${path} doesn't exist or failed read`)
    }
  }
}
