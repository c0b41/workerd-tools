import { TlsOptionsVersion } from '../../../types'
import { ObservedArray, observe } from '../utils'
import ServiceModule from './module'

export default class TlsOptions {
  private _keypair: Keypair
  private _requireClientCerts: boolean
  private _trustBrowserCas: boolean
  private _trustedCertificates = observe<string>([])
  private _cipherList: string
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

  get trustedCertificates(): ObservedArray<string> {
    return this._trustedCertificates
  }

  setTrustedCertificates(value: string) {
    this._trustedCertificates.add(value)
  }

  get cipherList(): string {
    return this._cipherList
  }

  setChipherList(value: string) {
    this._cipherList = value
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
