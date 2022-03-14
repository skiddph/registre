const Fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const _ = require("lodash");
const USID = require('usid');
const path = require('path');
const fs = require('fs');
const net = require('./lib/net');
const api = require('./src/plugins/api-v1')
const { createOptions } = require('./src/lib/utils')
const mkcert = require('./src/lib/mkcert')
require('dotenv').config();

async function start(opts = {}) {

  const TLS_KEY_FILE = 'app.key'
  const TLS_CERT_FILE = 'app.crt'
  const TLS_CRD_DIR = 'certs'

  // create ssl certs
  await mkcert({
    dir: path.join(process.cwd(), TLS_CRD_DIR),
    key: TLS_KEY_FILE,
    cert: TLS_CERT_FILE
  }).create()

  const fastifyOpts = createOptions(
    {
      // server default options 
    }, {
    dev: {
      options: {
        logger: true
      }
    },
    prod: {
      options: {
        logger: false,
        https: {
          allowHTTP1: true,
          key: fs.readFileSync(path.resolve(__dirname, `${TLS_CRD_DIR}/${TLS_KEY_FILE}`)),
          cert: fs.readFileSync(path.resolve(__dirname, `${TLS_CRD_DIR}/${TLS_CERT_FILE}`))
        }
      }
    }
  });

  const usid = new USID();
  const app = Fastify(fastifyOpts);

  if (process.env.NODE_ENV === 'production') app.register(require('fastify-https-redirect'));

  const prisma = new PrismaClient({});

  app.decorate('prisma', prisma);
  if (process.env.NODE_ENV === 'development') await app.register(require('fastify-cors'), {})
  await app.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET || usid.rand(24) })
  await app.register(api, { prefix: '/api' })
  await app.register(require('fastify-static'), { root: path.join(__dirname, 'public') })

  app.get('*', async (req, res) => { res.redirect('/') })

  await app.addHook('preValidation', async (req, res) => {
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
        return
      }

      req.user = await app.prisma.user.findUnique({ where: { id: decoded.user } })
      req.user = _.omit(req.user, [ 'hash' ])
    } catch (e) {
      console.log(e)
      req.user = null;
    }
  })

  const handler = (err, address) => {
    if (err) {
      console.log('Failed to start server')
      throw err
    }

    const protocol = address.includes('https') ? 'https' : 'http'
    const port = app.server.address().port

    console.log('Server started\n\nLinks:')
    console.log(`\tLocal - ${protocol}://127.0.0.1:${port}/`)

    for (let key in net) {
      if (net[ key ].length == 1) {
        console.log(`\t${key} - ${protocol}://${net[ key ][ 0 ]}:${port}/`)
      }
    }
  }

  const PORT = process.env.PORT || opts?.port || 3000
  const HOST = process.env.HOST || opts?.host || false
  return HOST ? app.listen(PORT, HOST, handler) : app.listen(PORT, handler)
}

start({ host: '0.0.0.0', port: '3000' })