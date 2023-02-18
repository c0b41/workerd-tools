//import { decodeKey } from './utils'
//import { PARAM_CACHE_TTL } from './constants'
import { FastifyReply, FastifyRequest } from 'fastify'
import { D1ServiceRoutes } from '../../../../types/index'

export default (gateway): D1ServiceRoutes => ({
  getDump: async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send('')
  },

  getQuery: async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send('')
  },

  getExecute: async (request: FastifyRequest, reply: FastifyReply) => {
    reply.send('')
  },
})
