import { List } from 'capnp-ts'
import { IServiceBindings, IUsage } from '../../types'
import { Wrapped, Binding, Service, CryptoKey } from './nodes'
import {
  ServiceDesignator,
  Worker_Binding,
  Worker_Binding_CryptoKey,
  Worker_Binding_CryptoKey_Usage,
} from './config/workerd.capnp'
import { Data, Wasm } from './nodes/binding'

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
      binding.cryptoKey.usages.forEach((usage: IUsage) => {
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

  return worker_binding
}

function createBinaryBinding(
  bindings: Set<Binding>,
  structServiceWorkerBindings: List<Worker_Binding>
) {
  structServiceWorkerBindings.forEach(
    (structServiceWorkerBinding: Worker_Binding, index: number) => {
      bindings.forEach((binding: Binding) => {
        switch (binding.which) {
          case 'text':
            structServiceWorkerBinding.setText(binding.text)
            break
          case 'data':
            let structServiceWorkerBindingData = structServiceWorkerBinding.initData(
              binding.data.toUint8Array.byteLength
            )
            structServiceWorkerBindingData.copyBuffer(binding.data.toUint8Array)
            structServiceWorkerBinding.setData(structServiceWorkerBindingData)
            break
          case 'json':
            structServiceWorkerBinding.setJson(binding.json)
            break
          case 'wasm':
            let structServiceWorkerBindingWasm = structServiceWorkerBinding.initData(
              binding.wasm.toUint8Array.byteLength
            )
            structServiceWorkerBindingWasm.copyBuffer(binding.wasm.toUint8Array)
            structServiceWorkerBinding.setWasmModule(structServiceWorkerBindingWasm)
            break
          case 'crypto':
            let structServiceWorkerBindingCrypto: Worker_Binding_CryptoKey =
              structServiceWorkerBinding.initCryptoKey()

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
              let structServiceWorkerBindingCryptoAlgo =
                structServiceWorkerBindingCrypto.initAlgorithm()
              structServiceWorkerBindingCryptoAlgo.setJson(binding.crypto.algorithm)
            }

            if (binding.crypto.usages && binding.crypto.usages.length > 0) {
              let usagesSize = binding.crypto.usages.length ?? 0
              let structServiceWorkerBindingCryptoUsages: List<Worker_Binding_CryptoKey_Usage> =
                structServiceWorkerBindingCrypto.initUsages(usagesSize)

              binding.crypto.usages.forEach((usage: IUsage, index: number) => {
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
            let structServiceWorkerBindingService: ServiceDesignator =
              structServiceWorkerBinding.initService()
            structServiceWorkerBindingService.setName(binding.service)
            structServiceWorkerBinding.setService(structServiceWorkerBindingService)
            break
          case 'kv':
            let structServiceWorkerBindingKV: ServiceDesignator =
              structServiceWorkerBinding.initKvNamespace()
            structServiceWorkerBindingKV.setName(binding.kvNamespace)
            structServiceWorkerBinding.setKvNamespace(structServiceWorkerBindingKV)
            break
          case 'r2_bucket':
            let structServiceWorkerBindingR2: ServiceDesignator =
              structServiceWorkerBinding.initR2Bucket()
            structServiceWorkerBindingR2.setName(binding.r2Bucket)
            structServiceWorkerBinding.setR2Bucket(structServiceWorkerBindingR2)
            break
          case 'queue':
            let structServiceWorkerBindingQueue: ServiceDesignator =
              structServiceWorkerBinding.initQueue()
            structServiceWorkerBindingQueue.setName(binding.queue)
            structServiceWorkerBinding.setQueue(structServiceWorkerBindingQueue)
            break
          case 'durable_object_namespace':
            let structServiceWorkerBindingDurableObjectNamespace =
              structServiceWorkerBinding.initDurableObjectNamespace()

            structServiceWorkerBindingDurableObjectNamespace.setClassName(
              binding.durableObjectNamespace
            )
            structServiceWorkerBinding.setDurableObjectNamespace(
              structServiceWorkerBindingDurableObjectNamespace
            )
          case 'wrapped':
            let structServiceWorkerBindingWrapped = structServiceWorkerBinding.initWrapped()

            if (binding.wrapped.moduleName) {
              structServiceWorkerBindingWrapped.setModuleName(binding.wrapped.moduleName)
            }

            if (binding.wrapped.entrypoint) {
              structServiceWorkerBindingWrapped.setEntrypoint(binding.wrapped.entrypoint)
            }
            if (binding.wrapped.innerBindings) {
              let wrappedBindingSize = binding.wrapped.innerBindings.size ?? 0
              let structServiceWorkerWrappedBindings =
                structServiceWorkerBindingWrapped.initInnerBindings(wrappedBindingSize)
              //this.createBinaryBinding(
              //  binding.wrapped.innerBindings,
              //  structServiceWorkerWrappedBindings
              //)
            }

            structServiceWorkerBinding.setWrapped(structServiceWorkerBindingWrapped)
            break
          default:
            break
        }
        structServiceWorkerBinding.setName(binding.name)
        structServiceWorkerBindings.set(index, structServiceWorkerBinding)
      })
    }
  )
}

function unionServices(sets): Set<Service> {
  return sets.reduce((combined, list) => {
    return new Set([...combined, ...list])
  }, new Set())
}

function toUint8Array(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}

export { createBinding, createBinaryBinding, unionServices, toUint8Array }
