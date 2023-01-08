import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { cachePluginOptions } from '../../../../types/main'
import cacheService from './service'

let defaults = {
  path: undefined,
  gateway: null,
}

export default fp(async (app: FastifyInstance, opts: cachePluginOptions = defaults) => {
  const {
    path,
    gateway = () => {
      console.log('CACHE gateway')
    },
  } = opts

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
