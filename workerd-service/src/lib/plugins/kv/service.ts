//import { decodeKey } from './utils'
import { PARAM_CACHE_TTL } from './constants'
import { FastifyReply, FastifyRequest } from 'fastify'
import { KvServiceRoutes, requestKvParams } from '../../../../types/main'

export default (gateway): KvServiceRoutes => ({
  listKv: async (request: FastifyRequest<{ Params: requestKvParams }>, reply: FastifyReply) => {
    reply.send('')
  },
  getKv: async (request: FastifyRequest<{ Params: requestKvParams }>, reply: FastifyReply) => {
    const namespace = request.params.ns ?? 'default'

    const key = request.params.key // key always encoded.
    const cacheTtlParam = request.query[PARAM_CACHE_TTL]
    const cacheTtl = cacheTtlParam === null ? undefined : parseInt(cacheTtlParam)
    console.log(gateway)
    return reply.send('')
  },

  putKv: async (request: FastifyRequest<{ Params: requestKvParams }>, reply: FastifyReply) => {
    reply.send('')
  },
  deleteKv: async (request: FastifyRequest<{ Params: requestKvParams }>, reply: FastifyReply) => {
    reply.send('')
  },
})
