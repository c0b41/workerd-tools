import { TlsOptionsVersion } from '../../../types'
import ServiceModule from './module'

export default class Https {
  private _keypair: Keypair
  private _requireClientCerts: boolean
  private _trustBrowserCas: boolean
  private _minVersion: TlsOptionsVersion

  get keypair(): Keypair {
    return this._keypair
  }

  setKeypair(value: Keypair) {
    this._keypair = value
  }

  get requireClientCerts(): boolean {
    return this._requireClientCerts
  }

  setRequireClientCerts(value: boolean) {
    this._requireClientCerts = value
  }

  get trustBrowserCas(): boolean {
    return this._trustBrowserCas
  }

  setTrustBrowserCas(value: boolean) {
    this._trustBrowserCas = value
  }

  get minVersion(): TlsOptionsVersion {
    return this._minVersion
  }

  setMinVersion(value: TlsOptionsVersion) {
    this._minVersion = value
  }
}

export class Keypair {
  private _privateKey: ServiceModule
  private _certificateChain: ServiceModule

  get privateKey(): ServiceModule {
    return this._privateKey
  }

  setPrivateKey(value: ServiceModule) {
    this._privateKey = value
  }

  get certificateChain(): ServiceModule {
    return this._certificateChain
  }

  setCertificateChain(value: ServiceModule) {
    this._certificateChain = value
  }
}
