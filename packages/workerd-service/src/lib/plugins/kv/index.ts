import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { kvPluginOptions } from '../../../../types/main'
import kvService from './service'

let defaults = {
  path: undefined,
  gateway: null,
}

export default fp(async (app: FastifyInstance, opts: kvPluginOptions = defaults) => {
  const {
    path,
    gateway = () => {
      console.log('KV gateway')
    },
  } = opts

  const routes = kvService(gateway)

  app.register(
    async (service: FastifyInstance) => {
      //service.decorate('kv', { gateway })
      service.get('/kv/:ns', routes.listKv)
      service.get('/kv/:ns/:key', routes.getKv)

      service.put('/kv/:ns/:key', routes.putKv)
      service.delete('/kv/:ns/:key', routes.deleteKv)
    },
    { prefix: path }
  )
})
