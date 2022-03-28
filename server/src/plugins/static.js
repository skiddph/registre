const fp = require('fastify-plugin')
const path = require('path')
const fStatic = require('fastify-static')

const plugin = fp(async (app, opts = {}, done) => {
  const { public = path.join(process.cwd(), 'public') } = opts

  await app.register(fStatic, { root: public})

  done()
}, {
  name: 'registre-static',
  fastify: '3.x'
})

module.exports = plugin