export default class DurableObjectStorage {
  private _inMemory?: boolean
  private _localDisk?: string

  get inMemory(): boolean {
    return this._inMemory
  }

  setInMemory(value: boolean) {
    this._inMemory = value
  }

  get localDisk(): string {
    return this._localDisk
  }

  setLocalDisk(value: string) {
    this._localDisk = value
  }
}
