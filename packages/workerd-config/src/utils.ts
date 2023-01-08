import KV_SCRIPT from './plugins/kv_script.txt'
import CACHE_SCRIPT from './plugins/cache_script.txt'

export const generateWorkerScript = (type: 'kv' | 'cache'): String => {
  switch (type) {
    case 'kv':
      return KV_SCRIPT
    case 'cache':
      return CACHE_SCRIPT
    default:
      return ``
  }
}
