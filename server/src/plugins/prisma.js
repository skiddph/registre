const { PrismaClient } = require('@prisma/client');
const fp = require('fastify-plugin')

const plugin = fp((app, opts = {}, done) => {
  const prisma = new PrismaClient(opts);
  app.decorate('prisma', prisma);
  done()
}, {
  name: 'registre-prisma',
  fastify: '3.x'
})

module.exports = plugin