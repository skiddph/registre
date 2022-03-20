const fp = require('fastify-plugin')
const _ = require("lodash");
const kMultipart = Symbol('multipart')
const path = require('node:path')

function setMultipart(request, payload, done) {
  request[ kMultipart ] = true
  done()
}

const plugin = fp(async (app, opts = {}, done) => {
  app.addContentTypeParser('multipart', setMultipart)
  const { tmp = path.join(process.cwd(), 'tmp') } = opts
  app.use(require('express-fileupload')({
    useTempFiles: true,
    tempFileDir: path.join(tmp, 'upload')
  }))
  app.addHook('preValidation', async (req, res) => {
    console.log('hook prevaL >>', Boolean(app.jwt))
    req.user = null;
    opts = opts || {}

    // credentials
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

  app.addHook('preValidation', async (req, res) => {
    // File upload
    if (req.raw?.files) {
      if(!req.body) req.body = {}
      Object.keys(req.raw.files).forEach((key) => {
        req.body[ key ] = req.raw.files[ key ]
      })
    }
  })
  done()
}, {
  name: 'registre-hooks',
  fastify: '3.x'
})

module.exports = plugin