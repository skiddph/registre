const fp = require('fastify-plugin')

const plugin = fp(async (app, opts, done) => {

  const { base_url } = opts

  const ERROR_CODE = {
    'SE001': {
      status: 'error',
      code: 'SE001',
      message: 'Failed to get settings'
    },
    'SE002': {
      status: 'error',
      code: 'SE002',
      message: 'Failed to create or update settings'
    },
    'SE003': {
      status: 'error',
      code: 'SE003',
      message: 'Failed to delete settings'
    },
    'SE004': {
      status: 'error',
      code: 'SE004',
      message: 'Unauthorized Request'
    },
    'SE005': {
      status: 'error',
      code: 'SE005',
      message: "'key' and 'value' must be provided"
    },
    'SE006': {
      status: 'error',
      code: 'SE006',
      message: "'key' must be provided"
    },
  }

  const SUCCESS_CODE = {
    'SS001': {
      status: 'success',
      code: 'SE001',
      message: 'Successfully get settings'
    },
    'SS002': {
      status: 'success',
      code: 'SE002',
      message: 'Successfully create or update settings'
    },
    'SS003': {
      status: 'success',
      code: 'SE003',
      message: 'Successfully delete settings'
    },
    'SS004': {
      status: 'success',
      code: 'SE004',
      message: 'Successfully get settings'
    },
  }

  app.get(`${base_url}/system`, async (req, res) => {

    const query = Object.create(null)

    if (!req.user || req.user.role < 1) {
      query.where = {
        role: 0
      }
    } else if (req.user.role > 1) {
      query.where = {
        role: {
          gte: req.user.role
        }
      }
    }

    return await app.prisma.system.findMany(query)
      .then(e => {
        const data = Object.create(null)
        e.forEach(i => data[ i.key ] = typeof i.value === 'string' ? JSON.parse(i.value) : i.value)
        return res.code(200).send({
          ...SUCCESS_CODE[ 'SS001' ],
          data
        })
      })
      .catch((e) => {
        console.log(e)
        return res.code(500).send(ERROR_CODE[ 'SE001' ])
      })
  })

  app.delete(`${base_url}/system`, async (req, res) => {
    // reject if user role is less than 1
    if (!req.user || req.user.role < 1) {
      return res.code(401).send(ERROR_CODE[ 'SE004' ])
    }

    // get key from req.body
    const { key } = req.body

    // reject if key is empty
    if (!key) {
      return res.code(400).send(ERROR_CODE[ 'SE006' ])
    }

    // delete data in System
    return await app.prisma.system.delete({
      where: {
        key: key
      }
    })
  })

  const createUpdateHandler = async (req, res) => {
    // reject if user role is less than 1
    if (!req.user || req.user.role < 1) {
      return res.code(401).send(ERROR_CODE[ 'SE004' ])
    }

    // get key and value from req.body
    const { key, value, role } = req.body

    // reject if keys or values are empty
    if (!key || !value) {
      return res.code(400).send(ERROR_CODE[ 'SE005' ])
    }

    // create or update data in System
    return await app.prisma.system.upsert({
      where: {
        key: key
      },
      update: {
        value: value,
        ...(typeof role === 'number' ? { role: parseInt(role) } : {})
      },
      create: {
        key: key,
        value: value,
        role: typeof role === 'number' ? parseInt(role) : 0
      }
    })
      .then(e => {
        return res.code(200).send({
          ...SUCCESS_CODE[ 'SS002' ],
          data: {
            key: e.key,
            value: e.value,
          }
        })
      })
      .catch((e) => {
        console.log(e)
        return res.code(500).send(ERROR_CODE[ 'SE002' ])
      })
  }

  app.post(`${base_url}/system`, createUpdateHandler)
  app.put(`${base_url}/system`, createUpdateHandler)

  done()
})

module.exports = plugin