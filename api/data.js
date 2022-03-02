const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const backup = async (app, fields) => {
  const data = {}
  for (field of fields) data[ field ] = await app.prisma[ field ].findMany({});
  const encode = Buffer.from(JSON.stringify(data)).toString('base64')
  return { data: encode }
}

const restore = async (app, data) => {
  let rows = 0
  let fail = 0
  try {
    let decode = JSON.parse(Buffer.from(data, 'base64').toString('ascii'))
    const hasLog = decode?.logs ? true : false
    if (hasLog) {
      const logs = decode[ 'logs' ]
      delete decode[ 'logs' ]
      decode = { ...decode, logs }
    }

    for (let field in decode) {
      for (let row in decode[ field ]) {
        try {
          rows++
          await app.prisma[ field ].create({ data: decode[ field ][ row ] })
        } catch (e) {
          console.log(e)
          fail++
        }
      }
    }
  } catch (e) {
    console.log(e)
    return false
  }
  console.log('\n>>> ROWS', rows, '\n>>> FAIL', fail)
  return true;
}

const reset = async (app) => {
  const fields = [ 'user', 'unit', 'position', 'office', 'logs', 'employee' ]
  let fail = 0
  for (let field of fields) 
    await app.prisma[ field ]
      .deleteMany({})
      .catch(() => fail++)
  
  return !!!fail
}

module.exports = function (app, base_url) {
  app.post(`${base_url}/backup`, async (req, res) => {
    const fields = req.body?.fields || []
    const data = await backup(app, fields);
    return res.send(data)
  })

  app.post(`${base_url}/restore`, async (req, res) => {
    const { data } = req.body
    if(!data) return res.send({ error: 'No data' })
    await restore(app, data)
      .then(e => {
        res.send({ ...data, success: true })
      })
      .catch(e => {
        return res.code(500).send({ error: e.error || e.message })
      })
    return res.send(true)
  })

  app.post(`${base_url}/reset`, async (req, res) => {
    await reset(app)
    return res.send(data)
  })

  app.post(`${base_url}/backuptest`, async (req, res) => {
    const fields = [ 'user', 'unit', 'position', 'office', 'logs', 'employee' ]
    // const encode = await backup(app, fields);
    // fs.writeFile('data.txt', encode.data, function (err) {
    //   if (err) throw err;
    //   console.log('File is created successfully.');
    // });
    await fs.readFile('data.txt', 'utf8', async function (err, data) {
      if (err) throw err
      await restore(app, data)
    });

    return res.send([ true ])
  })
}