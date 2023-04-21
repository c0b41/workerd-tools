import { decodeCacheID, decodeNamespace } from './utils'
//import { PARAM_CACHE_TTL } from './constants'
import { FastifyReply, FastifyRequest } from 'fastify'
import { CacheServiceRoutes, IECacheGateway } from '../../../../types/index'

// https://developers.cloudflare.com/workers/runtime-apis/cache/#match
// https://github.com/cloudflare/miniflare/blob/aa06d436fc54693cd4c3f8da8f9189014ea73482/packages/tre/src/index.ts#L168
export default (gateway: IECacheGateway): CacheServiceRoutes => ({
  getCache: async (request: FastifyRequest, reply: FastifyReply) => {
    //let cacheID = decodeCacheID(request)
    //let namespace = decodeNamespace(request)
    //let uri = decodeURIComponent(request.params.uri)

    // let key =  todo request
    //let match = gateway.match(cacheID, namespace, key)

    // cacheid = uniq cache id
    // metadata = headers, status
    // value = cached body

    // if there is no medata return cachemiss response

    // if there is then return response
    // set response header "CF-Cache-Status", "HIT"

    // check request headers if everthing is ok return cached response
    //let result = await gateway.match()
    console.log(result)

    return reply.send('')
  },

  putCache: async (request: FastifyRequest, reply: FastifyReply) => {
    console.log(request)
    reply.send('')
  },

  deleteCache: async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send('')
  },
})
