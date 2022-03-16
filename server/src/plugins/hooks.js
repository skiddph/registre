const fp = require('fastify-plugin')
const _ = require("lodash");
const plugin = fp(async (app, opts = {}, done) => {
  await app.addHook('preValidation', async (req, res) => {
    console.log('hook prevaL >>', Boolean(app.jwt))
    req.user = null;
    try {
      if (!req.headers.authorization) {
        return
      }
      const token = req.headers.authorization.split(' ')[ 1 ];

      let decoded;

      try {
        decoded = await app.jwt.verify(token);
      } catch (err) {
        console.log('err', err)
        return
      }

      req.user = await app.prisma.user.findUnique({ where: { id: decoded.user } })
      req.user = _.omit(req.user, [ 'hash' ])
      console.log('user >>', req.user)
    } catch (e) {
      console.log('e', e)
      req.user = null;
    }
  })
  done()
}, {
  name: 'registre-hooks',
  fastify: '3.x'
})

module.exports = plugin