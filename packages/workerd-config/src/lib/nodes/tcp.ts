import TlsOptions from './tls'

export default class Tcp {
  private _tlsOptions: TlsOptions
  private _certificate_host: string
  constructor() {}
  get tlsOptions(): TlsOptions {
    return this._tlsOptions
  }

  setTlsOptions(value: TlsOptions) {
    this._tlsOptions = value
  }

  get certificateHost(): string {
    return this._certificate_host
  }

  setCertificateHost(value: string) {
    this._certificate_host = value
  }
}
