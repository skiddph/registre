const fp = require('fastify-plugin')

const plugin = fp(async (app, opts, done) => {
  const { secret = process.env.JWT_SECRET || app.usid.rand(24) } = opts
  await app.register(require('fastify-jwt'), { secret })
  done()
}, {
  name: 'registre-jwt',
  fastify: '3.x'
})

module.exports = plugin