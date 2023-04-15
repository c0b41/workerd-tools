import ServiceModule from './module'

export default class Https {
  private _keypair: Keypair

  get keypair(): Keypair {
    return this._keypair
  }

  set keypair(value: Keypair) {
    this._keypair = value
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
