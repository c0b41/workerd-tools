import { List } from 'capnp-ts'
import { IServiceBindings, ICryptoUsage } from '../../../types'
import { Wrapped, Binding, CryptoKey, Data, Wasm, HyperDrive } from '../nodes'
import { ServiceDesignator, Worker_Binding, Worker_Binding_CryptoKey, Worker_Binding_CryptoKey_Usage, Worker_Binding_Hyperdrive } from '../config/workerd.capnp'

function createBinding(binding: IServiceBindings): Binding {
  let worker_binding = new Binding()

  if (binding.name) {
    worker_binding.setName(binding.name)
  }

  if ('type' in binding) {
    switch (binding.type) {
      case 'text':
        worker_binding.setText(binding.content)
        break
      case 'data':
        let worker_binding_data = new Data()
        if (binding.content) {
          worker_binding_data.setContent(binding.content)
        }

        if (binding.path) {
          worker_binding_data.setPath(binding.path)
        }
        worker_binding.setData(worker_binding_data)
        break
      case 'json':
        worker_binding.setJson(binding.content)
        break
      case 'wasm':
        let worker_binding_wasm = new Wasm()
        if (binding.content) {
          worker_binding_wasm.setContent(binding.content)
        }

        if (binding.path) {
          worker_binding_wasm.setPath(binding.path)
        }
        worker_binding.setWasm(worker_binding_wasm)
        break
      default:
        break
    }
  }

  if ('service' in binding) {
    worker_binding.setService(binding.service)
  }

  if ('kvNamespace' in binding) {
    worker_binding.setKvNamespace(binding.kvNamespace)
  }

  if ('r2Bucket' in binding) {
    worker_binding.setR2Bucket(binding.r2Bucket)
  }

  if ('r2Admin' in binding) {
    worker_binding.setR2Admin(binding.r2Admin)
  }

  if ('queue' in binding) {
    worker_binding.setQueue(binding.queue)
  }

  if ('cryptoKey' in binding) {
    let worker_binding_crypto = new CryptoKey()

    if (binding.cryptoKey.raw) {
      worker_binding_crypto.setRaw(binding.cryptoKey.raw)
    }

    if (binding.cryptoKey.hex) {
      worker_binding_crypto.setHex(binding.cryptoKey.hex)
    }

    if (binding.cryptoKey.base64) {
      worker_binding_crypto.setBase64(binding.cryptoKey.base64)
    }

    if (binding.cryptoKey.jwk) {
      worker_binding_crypto.setJwk(binding.cryptoKey.jwk)
    }

    if (binding.cryptoKey.pkcs8) {
      worker_binding_crypto.setPkcs8(binding.cryptoKey.pkcs8)
    }

    if (binding.cryptoKey.spki) {
      worker_binding_crypto.setPkcs8(binding.cryptoKey.spki)
    }

    if (binding.cryptoKey.algorithm) {
      worker_binding_crypto.setalgorithm(binding.cryptoKey.algorithm.json)
    }

    if (binding.cryptoKey.usages) {
      binding.cryptoKey.usages.forEach((usage: ICryptoUsage) => {
        worker_binding_crypto.setUsages(usage)
      })
    }

    if (binding.cryptoKey.extractable) {
      worker_binding_crypto.setExtractable(binding.cryptoKey.extractable)
    }

    worker_binding.setCrypto(worker_binding_crypto)
  }

  if ('durableObjectNamespace' in binding) {
    worker_binding.setDurableObjectNamespace(binding.durableObjectNamespace)
  }

  if ('wrapped' in binding) {
    let wrapped = new Wrapped()

    if (binding.wrapped.moduleName) {
      wrapped.setModuleName(binding.wrapped.moduleName)
    }

    if (binding.wrapped.entrypoint) {
      wrapped.setEntrypoint(binding.wrapped.entrypoint)
    }

    if (binding.wrapped.innerBindings) {
      binding.wrapped.innerBindings.forEach((binding: IServiceBindings) => {
        let worker_binding = createBinding(binding)
        wrapped.setInnerBindings(worker_binding)
      })
    }

    worker_binding.setWrapped(wrapped)
  }

  if ('fromEnvironment' in binding) {
    worker_binding.setFromEnvironment(binding.fromEnvironment)
  }

  if ('analyticsEngine' in binding) {
    worker_binding.setAnalyticsEngine(binding.analyticsEngine)
  }

  if ('unsafeEval' in binding) {
    worker_binding.setUnsafeEval(binding.unsafeEval)
  }

  if ('hyperDrive' in binding) {
    let hyperDrive = new HyperDrive()

    if (binding.hyperDrive.designator) {
      hyperDrive.setDesignator(binding.hyperDrive.designator)
    }

    if (binding.hyperDrive.database) {
      hyperDrive.setDatabase(binding.hyperDrive.database)
    }

    if (binding.hyperDrive.user) {
      hyperDrive.setUser(binding.hyperDrive.user)
    }

    if (binding.hyperDrive.password) {
      hyperDrive.setPassword(binding.hyperDrive.password)
    }

    if (binding.hyperDrive.scheme) {
      hyperDrive.setScheme(binding.hyperDrive.scheme)
    }

    worker_binding.setHyperDrive(hyperDrive)
  }
  return worker_binding
}

function createBinaryBinding(bindings: ObservedArray<Binding>, structServiceWorkerBindings: List<any>) {
  bindings.forEach((binding: Binding, index: number) => {
    let structServiceWorkerBinding: Worker_Binding = structServiceWorkerBindings.get(index)
    switch (binding.which) {
      case 'text':
        structServiceWorkerBinding.setText(binding.text)
        break
      case 'data':
        let structServiceWorkerBindingData = structServiceWorkerBinding.initData(binding.data.toUint8Array.byteLength)
        structServiceWorkerBindingData.copyBuffer(binding.data.toUint8Array)
        structServiceWorkerBinding.setData(structServiceWorkerBindingData)
        break
      case 'json':
        structServiceWorkerBinding.setJson(binding.json)
        break
      case 'wasm':
        let structServiceWorkerBindingWasm = structServiceWorkerBinding.initData(binding.wasm.toUint8Array.byteLength)
        structServiceWorkerBindingWasm.copyBuffer(binding.wasm.toUint8Array)
        structServiceWorkerBinding.setWasmModule(structServiceWorkerBindingWasm)
        break
      case 'crypto':
        let structServiceWorkerBindingCrypto: Worker_Binding_CryptoKey = structServiceWorkerBinding.initCryptoKey()

        if (binding.crypto.raw) {
          let raw8Array = toUint8Array(binding.crypto.raw)
          let data = structServiceWorkerBindingCrypto.initRaw(raw8Array.byteLength)
          data.copyBuffer(raw8Array)
          structServiceWorkerBindingCrypto.setRaw(data)
        }

        if (binding.crypto.base64) {
          structServiceWorkerBindingCrypto.setBase64(binding.crypto.base64)
        }

        if (binding.crypto.hex) {
          structServiceWorkerBindingCrypto.setHex(binding.crypto.hex)
        }

        if (binding.crypto.jwk) {
          structServiceWorkerBindingCrypto.setJwk(binding.crypto.jwk)
        }

        if (binding.crypto.pkcs8) {
          structServiceWorkerBindingCrypto.setPkcs8(binding.crypto.pkcs8)
        }

        if (binding.crypto.spki) {
          structServiceWorkerBindingCrypto.setSpki(binding.crypto.spki)
        }

        if (binding.crypto.algorithm && binding.crypto.algorithm) {
          let structServiceWorkerBindingCryptoAlgo = structServiceWorkerBindingCrypto.initAlgorithm()
          structServiceWorkerBindingCryptoAlgo.setJson(binding.crypto.algorithm)
        }

        if (binding.crypto.usages && binding.crypto.usages.length > 0) {
          let usagesSize = binding.crypto.usages.length ?? 0
          let structServiceWorkerBindingCryptoUsages: List<Worker_Binding_CryptoKey_Usage> = structServiceWorkerBindingCrypto.initUsages(usagesSize)

          binding.crypto.usages.forEach((usage: number, index: number) => {
            structServiceWorkerBindingCryptoUsages.set(index, usage)
          })

          structServiceWorkerBindingCrypto.setUsages(structServiceWorkerBindingCryptoUsages)
        }

        if (binding.crypto.extractable) {
          structServiceWorkerBindingCrypto.setExtractable(binding.crypto.extractable)
        }

        structServiceWorkerBinding.setCryptoKey(structServiceWorkerBindingCrypto)
        break
      case 'service':
        let structServiceWorkerBindingService: ServiceDesignator = structServiceWorkerBinding.initService()
        structServiceWorkerBindingService.setName(binding.service)
        structServiceWorkerBinding.setService(structServiceWorkerBindingService)
        break
      case 'kv':
        let structServiceWorkerBindingKV: ServiceDesignator = structServiceWorkerBinding.initKvNamespace()
        structServiceWorkerBindingKV.setName(binding.kvNamespace)
        structServiceWorkerBinding.setKvNamespace(structServiceWorkerBindingKV)
        break
      case 'r2_bucket':
        let structServiceWorkerBindingR2: ServiceDesignator = structServiceWorkerBinding.initR2Bucket()
        structServiceWorkerBindingR2.setName(binding.r2Bucket)
        structServiceWorkerBinding.setR2Bucket(structServiceWorkerBindingR2)
        break
      case 'r2_admin':
        let structServiceWorkerBindingR2Admin: ServiceDesignator = structServiceWorkerBinding.initR2Admin()
        structServiceWorkerBindingR2.setName(binding.r2Admin)
        structServiceWorkerBinding.setR2Admin(structServiceWorkerBindingR2Admin)
        break
      case 'queue':
        let structServiceWorkerBindingQueue: ServiceDesignator = structServiceWorkerBinding.initQueue()
        structServiceWorkerBindingQueue.setName(binding.queue)
        structServiceWorkerBinding.setQueue(structServiceWorkerBindingQueue)
        break
      case 'durable_object_namespace':
        let structServiceWorkerBindingDurableObjectNamespace = structServiceWorkerBinding.initDurableObjectNamespace()

        structServiceWorkerBindingDurableObjectNamespace.setClassName(binding.durableObjectNamespace)
        structServiceWorkerBinding.setDurableObjectNamespace(structServiceWorkerBindingDurableObjectNamespace)
      case 'wrapped':
        let structServiceWorkerBindingWrapped = structServiceWorkerBinding.initWrapped()

        if (binding.wrapped.moduleName) {
          structServiceWorkerBindingWrapped.setModuleName(binding.wrapped.moduleName)
        }

        if (binding.wrapped.entrypoint) {
          structServiceWorkerBindingWrapped.setEntrypoint(binding.wrapped.entrypoint)
        }
        if (binding.wrapped.innerBindings) {
          let wrappedBindingSize = binding.wrapped.innerBindings.length ?? 0
          let structServiceWorkerWrappedBindings = structServiceWorkerBindingWrapped.initInnerBindings(wrappedBindingSize)
          //this.createBinaryBinding(
          //  binding.wrapped.innerBindings,
          //  structServiceWorkerWrappedBindings
          //)
        }

        structServiceWorkerBinding.setWrapped(structServiceWorkerBindingWrapped)
        break
      case 'from_environment':
        structServiceWorkerBinding.setFromEnvironment(binding.fromEnvironment)
        break
      case 'analytics_engine':
        let structServiceWorkerBindingAnalyticsEngine: ServiceDesignator = structServiceWorkerBinding.initAnalyticsEngine()
        structServiceWorkerBindingAnalyticsEngine.setName(binding.analyticsEngine)
        structServiceWorkerBinding.setAnalyticsEngine(structServiceWorkerBindingAnalyticsEngine)
        break
      case 'hyper_drive':
        let structServiceWorkerBindingHyperDrive: Worker_Binding_Hyperdrive = structServiceWorkerBinding.initHyperdrive()
        structServiceWorkerBindingHyperDrive.setDatabase(binding.hyperDrive.database)
        structServiceWorkerBindingHyperDrive.setUser(binding.hyperDrive.user)
        structServiceWorkerBindingHyperDrive.setPassword(binding.hyperDrive.password)
        structServiceWorkerBindingHyperDrive.setScheme(binding.hyperDrive.scheme)
        let structServiceWorkerBindingHyperDriveDesignator: ServiceDesignator = structServiceWorkerBindingHyperDrive.initDesignator()
        structServiceWorkerBindingHyperDriveDesignator.setName(binding.hyperDrive.designator)
        //structServiceWorkerBinding.setHyperdrive(structServiceWorkerBindingHyperDrive) // TODO: Dosen't exist
        break
      case 'unsafe_eval':
        structServiceWorkerBinding.setUnsafeEval()
        break
      default:
        break
    }
    structServiceWorkerBinding.setName(binding.name)
    structServiceWorkerBindings.set(index, structServiceWorkerBinding)
  })
}

function toUint8Array(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}

export type ObservedArray<T> = Array<T> & {
  get: (index: number) => T

  getAll: (rule: object, del_items?: boolean) => T[]

  remove: (index: number) => T[]

  first: () => T

  add: (value: any) => T[]
}

const isObserved = Symbol('ObservedArray.isObserved')

function observe<T>(obj: Array<T>): ObservedArray<T> {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop == isObserved) {
        return true
      }

      if (prop == 'get') {
        return (index: number) => target[index]
      }

      if (prop == 'getAll') {
        return (rule: object, del_items: boolean) => target.filter((obj, index) => {})
      }

      if (prop == 'first') {
        return () => target[0]
      }

      if (prop == 'remove') {
        return (index: number): any => target.splice(index, 1)
      }

      if (prop == 'add') {
        return (value: any): any => target.push(value)
      }

      return Reflect.get(target, prop)
    },
  }) as ObservedArray<T>
}

export { createBinding, createBinaryBinding, toUint8Array, observe }
