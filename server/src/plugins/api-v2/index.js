const fp = require('fastify-plugin')
const system = require('./system')
const user = require('./user')
const employee = require('./employee')
const log = require('./log')
const data = require('./data')
const { format } = require('date-fns')
const v2 = fp(async (app, opts, done) => {
  opts.base_url = opts.base_url || "/api/v2"

  await app.register(user, opts)
  await app.register(system, opts)
  await app.register(employee, opts)
  await app.register(log, opts)
  await app.register(data, opts)

  app.get(`${opts.base_url}/getservertime`, async (req, res) => {
    return res.code(200).send({
      data: format(new Date(), 'LLL d, hh:mm a')
    })
  })

  done()
}, {
  name: 'registre-api-v2',
  fastify: '3.x'
})

module.exports = v2