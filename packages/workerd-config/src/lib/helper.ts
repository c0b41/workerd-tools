import { IServiceBindings } from '../../types'
import {
  ServiceBindingBasic,
  ServiceBindingService,
  ServiceBindingCrypto,
  ServiceBindingDurableObjectNamespace,
  ServiceBindingWrapped,
  Wrapped,
  IBinding,
} from './nodes'

function createBinding(binding: IServiceBindings): IBinding {
  let worker_binding = null
  if ('type' in binding) {
    worker_binding = new ServiceBindingBasic()

    if (binding.name) {
      worker_binding.setName(binding.name)
    }

    if (binding.content) {
      worker_binding.setContent(binding.content)
    }

    if (binding.path) {
      worker_binding.setPath(binding.path)
    }

    if (binding.type) {
      worker_binding.seType(binding.type)
    }
  }

  if ('service' in binding) {
    worker_binding = new ServiceBindingService()
    worker_binding.setService(binding.service)
  }

  if ('kvNamespace' in binding) {
    worker_binding = new ServiceBindingService()
    worker_binding.setKvNamespace(binding.kvNamespace)
  }

  if ('r2Bucket' in binding) {
    worker_binding = new ServiceBindingService()
    worker_binding.setR2Bucket(binding.r2Bucket)
  }

  if ('queue' in binding) {
    worker_binding = new ServiceBindingService()
    worker_binding.setQueue(binding.queue)
  }

  if ('cryptoKey' in binding) {
    worker_binding = new ServiceBindingCrypto()

    if (binding.name) {
      worker_binding.setName(binding.name)
    }

    if (binding.cryptoKey.raw) {
      worker_binding.setRaw(binding.cryptoKey.raw)
    }

    if (binding.cryptoKey.hex) {
      worker_binding.setHex(binding.cryptoKey.hex)
    }

    if (binding.cryptoKey.base64) {
      worker_binding.setBase64(binding.cryptoKey.base64)
    }

    if (binding.cryptoKey.jwk) {
      worker_binding.setJwk(binding.cryptoKey.jwk)
    }

    if (binding.cryptoKey.pkcs8) {
      worker_binding.setPkcs8(binding.cryptoKey.pkcs8)
    }

    if (binding.cryptoKey.spki) {
      worker_binding.setPkcs8(binding.cryptoKey.spki)
    }

    if (binding.cryptoKey.algorithm) {
      worker_binding.setalgorithm(binding.cryptoKey.algorithm.json)
    }

    if (binding.cryptoKey.usages) {
      binding.cryptoKey.usages.forEach((usage: string) => {
        worker_binding.setUsages(usage)
      })
    }

    if (binding.cryptoKey.extractable) {
      worker_binding.setExtractable(binding.cryptoKey.extractable)
    }
  }

  if ('durableObjectNamespace' in binding) {
    worker_binding = new ServiceBindingDurableObjectNamespace()

    if (binding.name) {
      worker_binding.setName(binding.name)
    }

    if (binding.durableObjectNamespace) {
      worker_binding.setDurableObjectNamespace(binding.durableObjectNamespace)
    }
  }

  if ('wrapped' in binding) {
    worker_binding = new ServiceBindingWrapped()
    let wrapped = new Wrapped()

    if (binding.name) {
      worker_binding.setName(binding.name)
    }

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

export { createBinding }
