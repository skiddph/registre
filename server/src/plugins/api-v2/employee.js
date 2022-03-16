const fp = require('fastify-plugin')

const plugin = fp(async (app, opts, done) => {
  const { base_url } = opts


  const ERROR_CODE = {
    'EE001': {
      status: 'error',
      code: 'EE001',
      message: 'Failed to get employee data'
    },
    'EE002': {
      status: 'error',
      code: 'EE002',
      message: 'Failed to get employees data'
    },
    'EE003': {
      status: 'error',
      code: 'EE003',
      message: 'Failed to create employee'
    },
    'EE004': {
      status: 'error',
      code: 'EE004',
      message: 'Failed to update employee'
    },
    'EE005': {
      status: 'error',
      code: 'EE005',
      message: 'Failed to delete employee'
    },
    'EE006': {
      status: 'error',
      code: 'EE006',
      message: 'Unauthorized Request'
    },
    'EE007': {
      status: 'error',
      code: 'EE007',
      message: "required fields are missing or invalid"
    },
    'EE008': {
      status: 'error',
      code: 'EE008',
      message: "employee already exists"
    },
    'EE009': {
      status: 'error',
      code: 'EE009',
      message: "employee not found"
    }
  }

  const SUCESS_CODE = {
    'ES001': {
      status: 'success',
      code: 'ES001',
      message: 'Employee created successfully'
    },
    'ES002': {
      status: 'success',
      code: 'ES002',
      message: 'Employee updated successfully'
    },
    'ES003': {
      status: 'success',
      code: 'ES003',
      message: 'Employee deleted successfully'
    },
    'ES004': {
      status: 'success',
      code: 'ES004',
      message: 'Employee data retrieved successfully'
    },
    'ES005': {
      status: 'success',
      code: 'ES005',
      message: 'Employees data retrieved successfully'
    }
  }

  const isAuthorized = (req, res) => {
    // authorized roles 
    const authorizedRole = [ 1, 2 ]

    // check if user role is authorized
    return authorizedRole.includes(req.user.role || 0)
  }

  app.post(`${base_url}/employee`, async (req, res) => {
    // is authorized
    if (!isAuthorized(req, res)) {
      return res.code(401).send(ERROR_CODE[ 'EE006' ])
    }

    // validate request body
    if (
      !req.body ||
      !req.body.id ||
      !req.body.name ||
      !req.body.dropdown_fields ||
      typeof req.body.dropdown_fields !== 'object' ||
      Array.isArray(req.body.dropdown_fields)
    ) {
      return res.code(400).send(ERROR_CODE[ 'EE007' ])
    }

    const { id, name, dropdown_fields } = req.body

    let failedPromise = false

    // get drop down fields from prisma.system
    const sys_dropdown_fields = await app.prisma.system.findUnique({
      where: {
        key: 'dropdown_fields'
      }
    })
      .then(data => {
        if (!data) {
          return []
        }
        return JSON.parse(data.value)
      })
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;

    // filter dropdown_fields by sys_dropdown_fields
    const dropdown_fields_filtered = Object.keys(dropdown_fields).reduce((acc, key) => {
      if (sys_dropdown_fields.includes(key)) {
        acc[ key ] = dropdown_fields[ key ]
      }
      return acc
    }, {})

    // create employee
    const employee = await app.prisma.employee.create({
      data: {
        id,
        name,
        data: JSON.stringify(dropdown_fields_filtered),
        addedBy: req.user.id
      }
    })
      .then(data => {
        return data
      })
      .catch(err => {
        failedPromise = true
        // if data already exists
        if (err.code === 'P2002') {
          return res.code(409).send(ERROR_CODE[ 'EE008' ])
        }
        return res.code(500).send(ERROR_CODE[ 'EE003' ])
      })

    if (failedPromise) return;

    // check employee
    if (!employee) {
      return res.code(500).send(ERROR_CODE[ 'EE003' ])
    }

    // transform data 
    const employee_data = {
      id: employee.id,
      name: employee.name,
      addedBy: employee.addedBy,
      ...JSON.parse(employee.data)
    }

    // return success response
    return res.code(201).send({
      ...SUCESS_CODE[ 'ES001' ],
      data: employee_data
    })
  })

  // TODO: create employee
  // TODO: get employee
  // TODO: get employees
  // TODO: upsert employee
  // TODO: delete employee
})

module.exports = plugin