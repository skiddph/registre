const Fastify = require('fastify');
const path = require('node:path');
const fs = require('node:fs');
const net = require('./lib/net');
const httpsRedirect = require('fastify-https-redirect')
const cors = require('fastify-cors')
const express = require('fastify-express')
const api2 = require('./src/plugins/api-v2')
const prisma = require('./src/plugins/prisma.js')
const hooks = require('./src/plugins/hooks.js')
const static = require('./src/plugins/static.js')
const usid = require('./src/plugins/usid.js')
const jwt = require('./src/plugins/jwt.js')
const { createOptions, onProd } = require('./src/lib/utils')
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
  }).createIfNotExists()

  const fastifyOpts = createOptions(
    {
      // server default options 
      https: {
        allowHTTP1: true,
        key: fs.readFileSync(path.resolve(process.cwd(), TLS_CRD_DIR, TLS_KEY_FILE)),
        cert: fs.readFileSync(path.resolve(process.cwd(), TLS_CRD_DIR, TLS_CERT_FILE))
      }
    }, {
    prod: {
      options: {
        logger: false
      }
    },
    dev: {
      options: {
        logger: true,
      }
    }
  });

  const app = Fastify(fastifyOpts);

  const pluginOpts = {
    public: path.join(process.cwd(), 'public'),
    tmp: path.join(process.cwd(), 'tmp'),
  }

  await app.register(express)
  await onProd(async () => await app.register(cors))
  await app.register(httpsRedirect)
  await app.register(usid)
  await app.register(prisma)
  await app.register(jwt, pluginOpts)
  await app.register(api2, pluginOpts)
  await app.register(static, pluginOpts)
  await app.register(hooks, pluginOpts)

  app.get('*', async (req, res) => { res.redirect('/') })

  const handler = (err, address) => {
    if (err) {
      console.log('[Server] Failed to start')
      return
    }

    const protocol = address.includes('https') ? 'https' : 'http'
    const port = app.server.address().port

    console.log('[Server] Started\n\nLinks:')
    console.log(`\tLocal - ${protocol}://127.0.0.1:${port}/`)

    for (let key in net) {
      if (net[ key ].length == 1) {
        console.log(`\t${key} - ${protocol}://${net[ key ][ 0 ]}:${port}/`)
      }
    }
  }

  const PORT = process.env.PORT || opts.port || 0
  const HOST = process.env.HOST || opts.host || '0.0.0.0'
  return HOST ? app.listen(PORT, HOST, handler) : app.listen(PORT, handler)
}
console.log('[Server] Starting...')
start({ port: '3000' })