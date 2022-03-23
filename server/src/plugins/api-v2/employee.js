const fp = require('fastify-plugin')
const _ = require('lodash')

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

  const getSystemDropdownFields = async (app, req, res) => {
    return await app.prisma.system.findUnique({
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
  }

  const mergeDropdownFields = (fields, data) => {
    const filtered = Object.create(null)
    for (let field of fields) {
      filtered[ field ] = data[ field ] || null
    }

    return filtered
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
    const sys_dropdown_fields = await getSystemDropdownFields(app, req, res)
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;

    // filter dropdown_fields by sys_dropdown_fields
    const dropdown_fields_filtered = mergeDropdownFields(sys_dropdown_fields, dropdown_fields)

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

  app.get(`${base_url}/employee/:id`, async (req, res) => {
    let failedPromise = false

    // is authorized
    if (!isAuthorized(req, res)) {
      return res.code(401).send(ERROR_CODE[ 'EE006' ])
    }

    // validate request params
    if (!req.params.id) {
      return res.code(400).send(ERROR_CODE[ 'EE007' ])
    }

    // get employee
    const employee = await app.prisma.employee.findUnique({
      where: {
        id: req.params.id
      }
    })
      .then(data => {
        if (!data) {
          return null
        }
        return data
      })
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;

    // check employee
    if (!employee) {
      return res.code(404).send(ERROR_CODE[ 'EE009' ])
    }

    // get drop down fields from prisma.system
    const sys_dropdown_fields = await getSystemDropdownFields(app, req, res)
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;


    // transform data 
    const employee_data = {
      id: employee.id,
      name: employee.name,
      ...mergeDropdownFields(sys_dropdown_fields, JSON.parse(employee.data))
    }

    // return success response
    return res.code(200).send({
      ...SUCESS_CODE[ 'ES004' ],
      data: employee_data
    })
  })

  app.get(`${base_url}/employees`, async (req, res) => {
    let failedPromise = false

    // is authorized
    if (!isAuthorized(req, res)) {
      return res.code(401).send(ERROR_CODE[ 'EE006' ])
    }

    // get employees
    const employees = await app.prisma.employee.findMany()
      .then(data => {
        if (!data) {
          return []
        }
        return data
      })
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;

    // check employees
    if (!employees) {
      return res.code(404).send(ERROR_CODE[ 'EE009' ])
    }

    // get drop down fields from prisma.system
    const sys_dropdown_fields = await getSystemDropdownFields(app, req, res)
      .catch(err => {
        failedPromise = true
        return res.code(500).send(ERROR_CODE[ 'EE001' ])
      })

    if (failedPromise) return;

    // transform data 
    const employees_data = employees.map(employee => {
      return {
        id: employee.id,
        name: employee.name,
        ...mergeDropdownFields(sys_dropdown_fields, JSON.parse(employee.data))
      }
    })

    // return success response
    return res.code(200).send({
      ...SUCESS_CODE[ 'ES005' ],
      data: employees_data
    })
  })

  app.delete(`${base_url}/employee/:id`, async (req, res) => {
    let failedPromise = false

    // is authorized
    if (!isAuthorized(req, res)) {
      return res.code(401).send(ERROR_CODE[ 'EE006' ])
    }

    // validate request params
    if (!req.params?.id) {
      return res.code(400).send(ERROR_CODE[ 'EE007' ])
    }

    // delete employee
    const deleted_employee = await app.prisma.employee.delete({
      where: {
        id: req.params.id
      }
    })
      .then(data => {
        return data
      })
      .catch(e => {
        failedPromise = true
        if (e.code === 'P2025') {
          return res.code(404).send(ERROR_CODE[ 'EE009' ])
        }
        return res.code(500).send(ERROR_CODE[ 'EE005' ])
      })

    if (failedPromise) return;

    // check employee
    if (!deleted_employee) {
      return res.code(500).send(ERROR_CODE[ 'EE005' ])
    }

    const data = {
      ..._.omit(deleted_employee, [ 'data' ]),
      ...(typeof deleted_employee[ 'data' ] == 'string' ? JSON.parse(deleted_employee[ 'data' ]) || {} : {})
    }

    // return success response
    return res.code(200).send({
      ...SUCESS_CODE[ 'ES002' ],
      data
    })
  })

  app.put(`${base_url}/employee/:id`, async (req, res) => {
    let failedPromise = false

    // is authorized
    if (!isAuthorized(req, res)) {
      return res.code(401).send(ERROR_CODE[ 'EE006' ])
    }

    // validate request params
    if (!req.params.id) {
      return res.code(400).send(ERROR_CODE[ 'EE007' ])
    }

    // validate request body
    // must be atleast one field is present
    let { name, id, dropdown_fields } = req.body
    if (!name && !id && !dropdown_fields) {
      return res.code(400).send(ERROR_CODE[ 'EE008' ])
    }

    const query = Object.create(null)
    const new_data = Object.create(null)

    // if name is present
    if (name) {
      new_data.name = name
    }

    // if id is present
    if (id) {
      new_data.id = id
    }

    // if dropdown_fields is present
    if (dropdown_fields) {
      const sys_dropdown_fields = await getSystemDropdownFields(app, req, res)
        .catch(err => {
          failedPromise = true
          return res.code(500).send(ERROR_CODE[ 'EE001' ])
        })

      if (failedPromise) return;
      // merge dropdown fields
      const filtered_fields = mergeDropdownFields(sys_dropdown_fields, dropdown_fields)

      new_data.data = JSON.stringify(filtered_fields)
    }

    // upsert employee
    const upserted_employee = await app.prisma.employee.upsert({
      where: {
        id: req.params.id
      },
      update: new_data,
      create: {
        id: req.params.id,
        ...new_data,
        addedBy: req.user.id
      }
    })
      .catch(e => {
        failedPromise = true
        if (e.code === 'P2025') {
          return res.code(404).send(ERROR_CODE[ 'EE009' ])
        }
        if (e.code === 'P2002') {
          return res.code(400).send(ERROR_CODE[ 'EE008' ])
        }
        return res.code(500).send(ERROR_CODE[ 'EE004' ])
      })

    if (failedPromise) return;

    // check employee
    if (!upserted_employee) {
      return res.code(500).send(ERROR_CODE[ 'EE004' ])
    }

    const data = {
      ..._.omit(upserted_employee, [ 'data' ]),
      ...(typeof upserted_employee[ 'data' ] == 'string' ? JSON.parse(upserted_employee[ 'data' ]) || {} : {})
    }

    // return success response
    return res.code(200).send({
      ...SUCESS_CODE[ 'ES002' ],
      data
    })
  })
})

module.exports = plugin