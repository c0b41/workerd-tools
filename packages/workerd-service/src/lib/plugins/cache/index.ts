import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import cacheService from './service'
import CacheGateway from './gateway'
import { cachePluginOptions } from '../../../../types/index'

let defaults = {
  path: undefined,
}

export default fp(async (app: FastifyInstance, opts: cachePluginOptions = defaults) => {
  const { path } = opts

  let gateway = new CacheGateway(app)
  const routes = cacheService(gateway)

  app.register(
    async (service: FastifyInstance) => {
      service.get('/cache/:uri', routes.getCache)
      service.put('/cache/:uri', routes.putCache)
      service.delete('/cache/:uri', routes.deleteCache) // https://github.com/fastify/fastify/issues/9
    },
    { prefix: path }
  )
})
