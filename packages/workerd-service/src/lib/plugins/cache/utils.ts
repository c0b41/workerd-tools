import { FastifyInstance, FastifyRequest } from 'fastify'
import { CacheNamespace, LoopCacheID } from './constants'

export function decodeNamespace(request: FastifyRequest) {
  let namespace = request.headers[CacheNamespace]

  return namespace !== 'undefined' ? namespace : 'default'
}

export function decodeCacheID(request: FastifyRequest) {
  let cacheID = request.headers[LoopCacheID]

  return cacheID !== 'undefined' ? cacheID : null
}
