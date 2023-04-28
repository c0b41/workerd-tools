import { IUsage } from '../../../types'
import { ObservedArray, observe } from '../utils'
import ServiceModule from './module'

export type IBindingType =
  | 'text'
  | 'data'
  | 'json'
  | 'wasm'
  | 'crypto'
  | 'service'
  | 'durable_object_namespace'
  | 'kv'
  | 'r2_bucket'
  | 'r2_admin'
  | 'wrapped'
  | 'queue'

export class Binding {
  private _name: string
  private _which: IBindingType = 'text'
  private _text: string
  private _data: Data
  private _json: string
  private _wasm: Wasm
  private _crypto: CryptoKey
  private _service: string
  private _durableObjectNamespace: string
  private _kvNamespace: string
  private _r2Bucket: string
  private _r2Admin: string
  private _queue: string
  private _wrapped: Wrapped

  get which(): string {
    return this._which
  }

  setWhich(value: IBindingType) {
    this._which = value
  }

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get text(): string {
    return this._text
  }

  setText(value: string) {
    this._text = value
    this.setWhich('text')
  }

  get data(): Data {
    return this._data
  }

  setData(value: Data) {
    this._data = value
    this.setWhich('data')
  }

  get json(): string {
    return this._json
  }

  setJson(value: string) {
    this._json = value
    this.setWhich('json')
  }

  get wasm(): Wasm {
    return this._wasm
  }

  setWasm(value: Wasm) {
    this._wasm = value
    this.setWhich('wasm')
  }

  get crypto(): CryptoKey {
    return this._crypto
  }

  setCrypto(value: CryptoKey) {
    this._crypto = value
    this.setWhich('crypto')
  }

  get service(): string {
    return this._service
  }

  setService(value: string) {
    this._service = value
    this.setWhich('service')
  }

  get durableObjectNamespace(): string {
    return this._durableObjectNamespace
  }

  setDurableObjectNamespace(value: string) {
    this._durableObjectNamespace = value
    this.setWhich('durable_object_namespace')
  }

  get kvNamespace(): string {
    return this._kvNamespace
  }

  setKvNamespace(value: string) {
    this._kvNamespace = value
    this.setWhich('kv')
  }

  get r2Bucket(): string {
    return this._r2Bucket
  }

  setR2Bucket(value: string) {
    this._r2Bucket = value
    this.setWhich('r2_bucket')
  }

  get r2Admin(): string {
    return this._r2Admin
  }

  setR2Admin(value: string) {
    this._r2Admin = value
    this.setWhich('r2_admin')
  }

  get queue(): string {
    return this._queue
  }

  setQueue(value: string) {
    this._queue = value
    this.setWhich('queue')
  }

  get wrapped(): Wrapped {
    return this._wrapped
  }

  setWrapped(value: Wrapped) {
    this._wrapped = value
    this.setWhich('wrapped')
  }
}

export class CryptoKey {
  private _raw?: string
  private _hex?: string
  private _base64?: string
  private _jwk?: string
  private _pkcs8?: string
  private _spki?: string
  private _algorithm?: string
  private _usages? = observe<IUsage>([])
  private _extractable: boolean

  get raw(): string {
    return this._raw
  }

  setRaw(value: string) {
    this._raw = value
  }

  get hex(): string {
    return this._hex
  }

  setHex(value: string) {
    this._hex = value
  }

  get base64(): string {
    return this._base64
  }

  setBase64(value: string) {
    this._base64 = value
  }

  get jwk(): string {
    return this._jwk
  }

  setJwk(value: string) {
    this._jwk = value
  }

  get pkcs8(): string {
    return this._pkcs8
  }

  setPkcs8(value: string) {
    this._pkcs8 = value
  }

  get spki(): string {
    return this._spki
  }

  setSpki(value: string) {
    this._spki = value
  }

  get algorithm(): string {
    return this._algorithm
  }

  setalgorithm(value: string) {
    this._algorithm = value
  }

  get usages(): ObservedArray<IUsage> {
    return this._usages
  }

  setUsages(value: IUsage) {
    this._usages.add(value)
  }

  get extractable(): boolean {
    return this._extractable
  }

  setExtractable(value: boolean) {
    this._extractable = value
  }
}

export class Wrapped extends ServiceModule {
  private _moduleName: string
  private _entrypoint?: string
  private _innerBindings = observe<Binding>([])

  get moduleName(): string {
    return this._moduleName
  }

  setModuleName(value: string) {
    this._moduleName = value
  }

  get entrypoint(): string {
    return this._entrypoint
  }

  setEntrypoint(value: string) {
    this._entrypoint = value
  }

  get innerBindings(): ObservedArray<Binding> {
    return this._innerBindings
  }

  setInnerBindings(value: Binding) {
    this._innerBindings.add(value)
  }
}

export class Wasm extends ServiceModule {}

export class Data extends ServiceModule {}
