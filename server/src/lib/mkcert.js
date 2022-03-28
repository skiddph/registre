const { createCA, createCert } = require('mkcert')
const fs = require('fs')
const path = require('path')

function mkcert({ caOpts = {}, certOpts = {}, dir = "", key = "", cert = "" }) {
  // check if dir is a string and a valid directory
  if (typeof dir !== 'string' || !fs.existsSync(dir)) {
    // create a default directory
    // project root
    dir = path.join(process.cwd(), 'certs')
    // create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  }

  // set caOpts defaults and merge with user options
  caOpts = Object.assign({
    organization: 'Skidd PH',
    countryCode: 'PH',
    state: 'Manila',
    locality: 'Filipino',
    validityDays: 365,
    ...caOpts
  })

  // path to the server's key and cert
  const caFile = path.join(dir, key || `server.key`)
  const certFile = path.join(dir, cert || `server.crt`)
  const cFiles = {
    key: caFile,
    cert: certFile
  }

  const create = async () => {
    // create a new CA
    return await createCA(caOpts)
      .then(async (caRes) => {
        // set certOpts defaults and merge with user options
        certOpts = Object.assign({
          domains: [ '127.0.0.1', 'localhost','127.0.0.1:3000' ],
          validityDays: 365,
          caKey: caRes.key,
          caCert: caRes.cert,
          ...certOpts
        })
        // create a new certificate
        return await createCert(certOpts)
          .then(async (certRes) => {
            // write the files to the directory and return an object of filenames
            fs.writeFileSync(caFile, certRes.key)
            fs.writeFileSync(certFile, certRes.cert)
            return cFiles
          })
      })
  }

  const createIfNotExists = async () => {
    // check if the files exist and create them if they don't
    if (!fs.existsSync(caFile) || !fs.existsSync(certFile)) {
      return await create()
    }

    return cFiles
  }

  return {
    create,
    createIfNotExists
  }
}

module.exports = mkcert