import KV_SCRIPT from './plugins/kv_script.txt'
import CACHE_SCRIPT from './plugins/cache_script.txt'
import DEV_SCRIPT from './plugins/dev_script.txt'

export const generateWorkerScript = (type: 'kv' | 'cache' | 'dev'): string => {
  switch (type) {
    case 'kv':
      return KV_SCRIPT
    case 'cache':
      return CACHE_SCRIPT
    case 'dev':
      return DEV_SCRIPT
    default:
      return ``
  }
}
