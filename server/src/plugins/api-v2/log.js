const fp = require('fastify-plugin')
const _ = require('lodash')
const { transformEmployeeData } = require('../../lib/log2.js')
const createMiddie = require('../../lib/create-middie.js')
const plugin = fp(async (app, opts, done) => {
  const { base_url, middleware } = opts

  const middie = createMiddie(middleware)

  const ERROR_CODE = {
    'LE001': {
      status: 'error',
      code: 'LE001',
      message: 'Failed to create log'
    },
    'LE002': {
      status: 'error',
      code: 'LE002',
      message: 'Failed to get logs'
    },
    'LE003': {
      status: 'error',
      code: 'LE003',
      message: 'Failed to update log'
    },
    'LE004': {
      status: 'error',
      code: 'LE004',
      message: 'Failed to delete log'
    },
    'LE005': {
      status: 'error',
      code: 'LE005',
      message: 'Failed to get user data'
    },
    'LE006': {
      status: 'error',
      code: 'LE006',
      message: 'Unauthorized Request'
    },
    'LE007': {
      status: 'error',
      code: 'LE007',
      message: 'Missing or Invalid parameter'
    },
    'LE008': {
      status: 'error',
      code: 'LE008',
      message: 'Duplicate logs'
    },
  }

  const SUCCESS_CODE = {
    'LS001': {
      status: 'success',
      code: 'LS001',
      message: 'Successfully create log'
    },
    'LS002': {
      status: 'success',
      code: 'LS002',
      message: 'Successfully get log'
    },
    'LS003': {
      status: 'success',
      code: 'LS003',
      message: 'Successfully update log'
    },
    'LS004': {
      status: 'success',
      code: 'LS004',
      message: 'Successfully delete log'
    }
  }

  // TODO: create log
  app.post(`${base_url}/log`, async (req, res) => {

    // check if body is empty
    if (!req.body || !req.body.id) {
      return res.code(400).send(ERROR_CODE[ 'LE007' ])
    }

    const { id } = req.body

    let failedPromise = false

    const employee = await app.prisma.employee.findUnique({
      where: {
        id
      }
    })
      .then(async (e) => await transformEmployeeData(app, e))
      .catch(e => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'LE005' ])
      })

    if (failedPromise) return;

    if (!employee) {
      return res.code(404).send(ERROR_CODE[ 'LE005' ])
    }
    return await middie(app, req, res, ERROR_CODE, SUCCESS_CODE).create(employee)
  })

  app.post(`${base_url}/logs`, async (req, res) =>
    await middie(app, req, res, ERROR_CODE, SUCCESS_CODE)
      .reads()
      .catch(() =>
        res.code(500).send(ERROR_CODE[ 'LE002' ])
      )
  )
  app.post(`${base_url}/logs/report`, async (req, res) =>
    await middie(app, req, res, ERROR_CODE, SUCCESS_CODE)
      .reports()
      .catch(() =>
        res.code(500).send(ERROR_CODE[ 'LE002' ])
      )
  )
  
  done()
})

module.exports = plugin