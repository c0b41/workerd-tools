import { default as kvService } from './lib/plugins/kv/index'
import { default as cacheService } from './lib/plugins/cache/index'
import fastifySqlite from 'fastify-sqlite'
import Fastify from 'fastify'

// https://github.com/Eomm/fastify-raw-body
async function main() {
  const app = Fastify({
    logger: false,
  })

  app.register(fastifySqlite, {
    dbFile: './db/foo.db',
    promiseApi: true,
    mode: fastifySqlite.sqlite3.OPEN_READONLY,
  })

  let handler = function (request, reply) {
    console.log(request.headers)
    console.log(`${request.method} = ${request.url}`)
    reply.send({ hello: 'world' })
  }

  app.get('/', handler)

  //app.register(kvService, {
  //  path: '/trafik',
  //})

  app.register(cacheService, {
    path: '/trafik',
  })

  // Run the server!
  app.listen({ port: 3030 }, function (err, address) {
    if (err) {
      console.log(err)
      //process.exit(1)
    }
    console.log(`Server is now listening on ${address}`)
  })
}

main()
