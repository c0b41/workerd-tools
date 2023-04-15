import ServiceModule from './module'

export type IBinding =
  | ServiceBindingBasic
  | ServiceBindingCrypto
  | ServiceBindingService
  | ServiceBindingDurableObjectNamespace
  | ServiceBindingWrapped

export type IServiceBindingTypes =
  | 'crypto'
  | 'service'
  | 'wrapped'
  | 'durableobjectnamespace'
  | 'text'
  | 'json'
  | 'wasm'
  | 'data'

export class ServiceBindingBasic extends ServiceModule {
  private _name: string
  private _type: 'text' | 'json' | 'wasm' | 'data'

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get type(): string {
    return this._type
  }

  setType(value: 'text' | 'json' | 'wasm' | 'data') {
    this._type = value
  }
}

export class CryptoKey {
  private _raw?: string
  private _hex?: string
  private _base64?: string
  private _jwk?: string
  private _pkcs8?: string
  private _spki?: string
  private _algorithm?: JSON
  private _usages?: Set<string>
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

  get algorithm(): JSON {
    return this._algorithm
  }

  setalgorithm(value: JSON) {
    this._algorithm = value
  }

  get usages(): Set<string> {
    return this._usages
  }

  setUsages(value: string) {
    this._usages.add(value)
  }

  get extractable(): boolean {
    return this._extractable
  }

  setExtractable(value: boolean) {
    this._extractable = value
  }
}

export class ServiceBindingCrypto extends CryptoKey {
  private _name: string
  private _type: 'crypto'

  get type(): string {
    return this._type
  }

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }
}

export class ServiceBindingService {
  private _name: string
  private _service?: string
  private _kvNamespace?: string
  private _r2Bucket?: string
  private _queue?: string
  private _type: 'service'

  get type(): string {
    return this._type
  }

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get service(): string {
    return this._service
  }

  setService(value: string) {
    this._service = value
  }

  get kvNamespace(): string {
    return this._kvNamespace
  }

  setKvNamespace(value: string) {
    this._kvNamespace = value
  }

  get r2Bucket(): string {
    return this._r2Bucket
  }

  setR2Bucket(value: string) {
    this._r2Bucket = value
  }

  get queue(): string {
    return this._queue
  }

  setQueue(value: string) {
    this._queue = value
  }
}

export class ServiceBindingDurableObjectNamespace {
  private _name: string
  private _durableObjectNamespace?: string
  private _type: 'durableobjectnamespace'

  get type(): string {
    return this._type
  }

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get durableObjectNamespace(): string {
    return this._durableObjectNamespace
  }

  setDurableObjectNamespace(value: string) {
    this._durableObjectNamespace = value
  }
}

export class Wrapped {
  private _moduleName: string
  private _entrypoint?: string
  private _innerBindings: Set<IBinding>

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

  get innerBindings(): Set<IBinding> {
    return this._innerBindings
  }

  setInnerBindings(value: IBinding) {
    this._innerBindings.add(value)
  }
}

export class ServiceBindingWrapped {
  private _name: string
  private _wrapped?: Wrapped
  private _type: 'wrapped'

  get type(): string {
    return this._type
  }

  get name(): string {
    return this._name
  }

  setName(value: string) {
    this._name = value
  }

  get wrapped(): Wrapped {
    return this._wrapped
  }

  setWrapped(value: Wrapped) {
    this._wrapped = value
  }
}
