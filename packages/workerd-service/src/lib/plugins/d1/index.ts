import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { d1PluginOptions } from '../../../../types/main'
import d1Service from './service'

let defaults = {
  path: undefined,
  gateway: null,
}

// D1 shim for https://github.com/cloudflare/wrangler2/blob/main/packages/wrangler/templates/d1-beta-facade.js
export default fp(async (app: FastifyInstance, opts: d1PluginOptions = defaults) => {
  const {
    path,
    gateway = () => {
      console.log('D1 gateway')
    },
  } = opts

  const routes = d1Service(gateway)

  app.register(
    async (service: FastifyInstance) => {
      service.post('/d1/dump', routes.getDump)
      service.post('/d1/query', routes.getQuery)
      service.post('/d1/execute', routes.getExecute)
    },
    { prefix: path }
  )
})
