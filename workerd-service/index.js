const Fastify = require('fastify')
const { kvService, cacheService } = require('./dist')

const app = Fastify({
  logger: false,
})

let handler = function (request, reply) {
  console.log(request.headers)
  console.log(`${request.method} = ${request.url}`)
  reply.send({ hello: 'world' })
}

app.get('/', handler)

app.register(kvService, {
  path: '/trafik',
})

//app.register(cacheService, {
//  path: '/trafik',
//})

// Run the server!
app.listen({ port: 3030 }, function (err, address) {
  if (err) {
    console.log(err)
    //process.exit(1)
  }
  console.log(`Server is now listening on ${address}`)
})
