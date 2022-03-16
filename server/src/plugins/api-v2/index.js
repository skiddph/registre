const fp = require('fastify-plugin')

const system = require('./system')
const user = require('./user')
const employee = require('./employee')

const v2 = fp(async (app, opts, done) => {
  opts.base_url = opts.base_url || "/api/v2"

  await app.register(user, opts)
  await app.register(system, opts)
  await app.register(employee, opts)

  done()
}, {
  name: 'registre-api-v2',
  fastify: '3.x'
})

module.exports = v2