const fp = require('fastify-plugin')

const api = async (app, opts) => {
  const base_url = opts?.url || "/api";

  require('./usercount')(app, base_url);
  require('./register')(app, base_url);
  require('./login')(app, base_url);
  require('./user')(app, base_url);
  require('./office')(app, base_url);
  require('./unit')(app, base_url);
  require('./position')(app, base_url);
  require('./employee')(app, base_url);
  
  return
}

module.exports = fp(api, {
  name: 'registre-api',
  fastify: '3.x'
})