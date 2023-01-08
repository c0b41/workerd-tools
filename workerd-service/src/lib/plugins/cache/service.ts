//import { decodeKey } from './utils'
//import { PARAM_CACHE_TTL } from './constants'
import { FastifyReply, FastifyRequest } from 'fastify'

export default (gateway): CacheServiceRoutes => ({
  getCache: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send('')
  },

  putCache: async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send('')
  },

  deleteCache: async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send('')
  },
})
