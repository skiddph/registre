const fp = require('fastify-plugin')
const path = require('node:path')
const fs = require('node:fs')

const plugins = fp(async (app, opts, done) => {

  let { base_url, public = path.join(process.cwd(), 'public'), tmp = path.join(process.cwd(), 'tmp') } = opts

  const dowload = path.join(public, 'download')
  const upload = path.join(tmp, 'upload')

  // if public dir not exists, create it
  if (!fs.existsSync(public)) {
    fs.mkdirSync(public)
  }

  // if dowload dir not exists, create it
  if (!fs.existsSync(dowload)) {
    fs.mkdirSync(dowload)
  }

  // delete old dowload files
  fs.readdirSync(dowload).forEach(file => {
    fs.unlinkSync(path.join(dowload, file))
  })

  // if tmp dir not exists, create it
  if (!fs.existsSync(tmp)) {
    fs.mkdirSync(tmp)
  }

  // if upload dir not exists, create it
  if (!fs.existsSync(upload)) {
    fs.mkdirSync(upload)
  }

  // delete old upload files
  fs.readdirSync(upload).forEach(file => {
    fs.unlinkSync(path.join(upload, file))
  })

  const ERROR_CODE = {
    'DE001': {
      status: 'error',
      code: 'DE001',
      message: 'Invalid params'
    },
    'DE002': {
      status: 'error',
      code: 'DE002',
      message: 'Backup must have atleast 1 valid table'
    },
  }

  const VALID_BACKUP_FIELDS = [
    'system',
    'user',
    'logs',
    'employee'
  ]

  app.post(`${base_url}/data/backup`, async (req, res) => {
    let { backup } = req.body

    // check if backup is valid array
    if (!backup || !Array.isArray(backup)) {
      return res.code(403).send(ERROR_CODE[ 'DE001' ])
    }

    // filter backup array
    backup = backup.filter(item => {
      return VALID_BACKUP_FIELDS.includes(item)
    })

    // check if backup is valid array
    if (backup.length === 0) {
      return res.code(403).send(ERROR_CODE[ 'DE002' ])
    }

    let data = {}

    for (let item of backup) {
      data[ item ] = await app.prisma[ item ].findMany()
    }

    // to JSON
    data = JSON.stringify(data)
    // to base64
    data = Buffer.from(data).toString('base64')
    data = JSON.stringify({
      version: 2,
      data
    }, null, 2)



    // write data to file
    const filename = `backup-${Date.now()}.json`
    const filepath = path.join(dowload, filename)
    fs.writeFileSync(filepath, data)
    return res.code(200).send({
      link: '/download/' + filename
    })
  })

  // data restore where they upload the file
  app.post(`${base_url}/data/restore`, async (req, res) => {
    // get file
    if(!req.body?.file?.tempFilePath){
      return res.code(403).send(ERROR_CODE[ 'DE001' ])
    }

    // get file
    const file = req.body?.file?.tempFilePath

    // check if a valid json
    let data;
    try {
      let data = fs.readFileSync(file)
      data = JSON.parse(data)
    } catch (error) {
      return res.code(403).send(ERROR_CODE[ 'DE001' ])
    }

    // check if data is valid
    if (!data){

    }
    
  })

  done()
})

module.exports = plugins