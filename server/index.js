const Fastify = require('fastify');
const path = require('node:path');
const fs = require('node:fs');
const net = require('./lib/net');
const httpsRedirect = require('fastify-https-redirect')
const cors = require('fastify-cors')
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
    }, {
    // dev: {
    //   options: {
    //     logger: true
    //   }
    // },
    dev: {
      options: {
        logger: true,
        https: {
          allowHTTP1: true,
          key: fs.readFileSync(path.resolve(process.cwd(), TLS_CRD_DIR, TLS_KEY_FILE)),
          cert: fs.readFileSync(path.resolve(process.cwd(), TLS_CRD_DIR, TLS_CERT_FILE))
        }
      }
    }
  });

  const app = Fastify(fastifyOpts);

  await onProd(async () => await app.register(cors))
  await app.register(httpsRedirect)
  await app.register(usid)
  await app.register(prisma)
  await app.register(jwt)
  await app.register(api2)
  await app.register(static)
  await app.register(hooks)

  app.get('*', async (req, res) => { res.redirect('/') })

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