import { PARAM_URL_ENCODED } from './constants'
export function decodeKey({ key }, query): string | Error {
  if (query.get(PARAM_URL_ENCODED).toLowerCase() !== 'true') return key
  try {
    return decodeURIComponent(key)
  } catch (error) {
    throw error
  }
}
