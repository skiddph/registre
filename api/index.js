const fp = require('fastify-plugin')
const _ = require('lodash')

const api = async (app, opts) => {
  const base_url = opts?.url || "/api";

  require('./create')(app, base_url);
  require('./delete')(app, base_url);
  require('./update')(app, base_url);
  require('./login')(app, base_url);
  require('./list')(app, base_url);
  require('./log')(app, base_url);
  require('./data')(app, base_url);

  return
}

module.exports = fp(api, {
  name: 'registre-api',
  fastify: '3.x'
})