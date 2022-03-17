const fp = require('fastify-plugin')
const path = require('node:path')
const fStatic = require('fastify-static')

const plugin = fp(async (app, opts = {}, done) => {
  const { public = "public" } = opts

  await app.register(fStatic, { root: path.join(process.cwd(), public)})

  done()
}, {
  name: 'registre-static',
  fastify: '3.x'
})

module.exports = plugin