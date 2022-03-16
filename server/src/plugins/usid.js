const fp = require('fastify-plugin')
const USID = require('usid');

const plugin = fp(async (app, opts, done) => {

  app.decorate('usid', new USID())

  done()
}, {
  name: 'registre-usid',
  fastify: '3.x'
})

module.exports = plugin