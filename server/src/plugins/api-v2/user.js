const fp = require('fastify-plugin')
const bcrypt = require('bcrypt');
const _ = require("lodash");

const plugin = fp(async (app, opts, done) => {

  const { base_url } = opts

  const ERROR_CODE = {
    'UE001': {
      status: 'error',
      code: 'UE001',
      message: 'Failed to get user data'
    },
    'UE002': {
      status: 'error',
      code: 'UE002',
      message: 'Failed to get users data'
    },
    'UE003': {
      status: 'error',
      code: 'UE003',
      message: 'Failed to create user'
    },
    'UE004': {
      status: 'error',
      code: 'UE004',
      message: 'Failed to update user'
    },
    'UE005': {
      status: 'error',
      code: 'UE005',
      message: 'Failed to delete user'
    },
    'UE006': {
      status: 'error',
      code: 'UE006',
      message: 'Unauthorized Request'
    },
    'UE007': {
      status: 'error',
      code: 'UE007',
      message: "required fields are missing or invalid"
    },
    'UE008': {
      status: 'error',
      code: 'UE008',
      message: "user already exists"
    },
    'UE009': {
      status: 'error',
      code: 'UE009',
      message: "user not found"
    },
    'UE010': {
      status: 'error',
      code: 'UE010',
      message: "Invalid credentials"
    }
  }

  const SUCCESS_CODE = {
    'US001': {
      status: 'success',
      code: 'US001',
      message: 'Successfully get user data'
    },
    'US002': {
      status: 'success',
      code: 'US002',
      message: 'Successfully get users data'
    },
    'US003': {
      status: 'success',
      code: 'US003',
      message: 'Successfully create user'
    },
    'US004': {
      status: 'success',
      code: 'US004',
      message: 'Successfully update user'
    },
    'US005': {
      status: 'success',
      code: 'US005',
      message: 'Successfully login user'
    },
    'US006': {
      status: 'success',
      code: 'US006',
      message: 'Successfully delete user'
    },
  }

  app.get(`${base_url}/user/:id`, async (req, res) => {
    if (!req.params) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    if (!req.user || req.user.role !== 1) {
      return res.code(401).send(ERROR_CODE[ 'UE006' ])
    }

    let { id } = req.params
    try {
      id = parseInt(id)
      if (id !== 0 && !id) throw new Error('id must be a number')
    } catch (e) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    const user = await app.prisma.user.findUnique({
      where: {
        id
      }
    })

    if (!user) {
      return res.code(404).send(ERROR_CODE[ 'UE009' ])
    }

    return res.code(200).send({
      ...SUCCESS_CODE[ 'US001' ],
      data: _.omit(user, [ 'hash' ])
    })
  })

  app.post(`${base_url}/user`, async (req, res) => {
    if (!req.body) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    // count user where role is 1, limit 1
    const count = await app.prisma.user.count({
      where: {
        role: 1
      }
    })

    let isSuperAdmin = false

    if (count <= 0) {
      isSuperAdmin = true
    }


    if (!isSuperAdmin && (req.user?.role !== 1)) {
      return res.code(401).send(ERROR_CODE[ 'UE006' ])
    }

    const { user, name, role, pass } = req.body

    if (!user || !name || !pass) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    // create hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    return await app.prisma.user.create({
      data: {
        user,
        name,
        role: isSuperAdmin ? 1 : role || 2,
        hash,
      }
    })
      .then(async (user) => {
        return res.code(201).send({
          ...SUCCESS_CODE[ 'US003' ],
          data: _.omit(user, [ 'hash' ]),
          token: await app.jwt.sign({ user: user.id })
        })
      })
      .catch(async (e) => {
        if (e.code === 'P2002') {
          return res.code(400).send(ERROR_CODE[ 'UE008' ])
        }

        return res.code(500).send(ERROR_CODE[ 'UE003' ])
      })
  })

  app.get(`${base_url}/users`, async (req, res) => {
    const users = await app.prisma.user.findMany({})

    if (!users) {
      return res.code(404).send(ERROR_CODE[ 'UE002' ])
    }

    const data = _.map(users, (user) => _.omit(user, [ 'hash' ]))
    return res.code(200).send({
      ...SUCCESS_CODE[ 'US002' ],
      data
    })
  })

  app.post(`${base_url}/login`, async (req, res) => {
    if (!req.body) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    const { user, pass } = req.body

    if (!user || !pass) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    const userData = await app.prisma.user.findUnique({
      where: {
        user
      }
    })

    if (!userData) {
      return res.code(404).send(ERROR_CODE[ 'UE009' ])
    }

    const isMatch = await bcrypt.compare(pass, userData.hash)

    if (!isMatch) {
      return res.code(401).send(ERROR_CODE[ 'UE010' ])
    }

    return res.code(200).send({
      ...SUCCESS_CODE[ 'US005' ],
      data: _.omit(userData, [ 'hash' ]),
      token: await app.jwt.sign({ user: userData.id })
    })
  })

  app.put(`${base_url}/user/:id`, async (req, res) => {
    if (!req.user || req.user.role !== 1) {
      return res.code(401).send(ERROR_CODE[ 'UE006' ])
    }

    if (!req.body || !req.params) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    let { id } = req.params
    try {
      id = parseInt(id)
      if (id !== 0 && !id) throw new Error('id must be a number')
    } catch (e) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    const { user, name, role, pass } = req.body

    // one of user, name, role, pass must be exist
    if (!user && !name && !role && !pass) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    const data = {}

    if (pass) {
      // create hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pass, salt);
      data.hash = hash
    }

    if (user) {
      data.user = user
    }

    if (name) {
      data.name = name
    }

    if (role) {
      data.role = role
    }

    return await app.prisma.user.update({
      where: {
        id: parseInt(id)
      },
      data
    })
      .then(async (user) => {
        return res.code(201).send({
          ...SUCCESS_CODE[ 'US004' ],
          data: _.omit(user, [ 'hash' ])
        })
      })
      .catch(async (e) => {
        if (e.code === 'P2002') {
          return res.code(400).send(ERROR_CODE[ 'UE008' ])
        }
        return res.code(500).send(ERROR_CODE[ 'UE003' ])
      })
  })

  app.delete(`${base_url}/user/:id`, async (req, res) => {
    if (!req.user || req.user.role !== 1) {
      return res.code(401).send(ERROR_CODE[ 'UE006' ])
    }

    if (!req.params) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    let { id } = req.params
    try {
      id = parseInt(id)
      if (id !== 0 && !id) throw new Error('id must be a number')
    } catch (e) {
      return res.code(400).send(ERROR_CODE[ 'UE007' ])
    }

    return await app.prisma.user.delete({
      where: {
        id: parseInt(id)
      }
    })
      .then(async (user) => {
        return res.code(201).send({
          ...SUCCESS_CODE[ 'US006' ],
          data: _.omit(user, [ 'hash' ])
        })
      })
      .catch(async (e) => {
        if (e.code === 'P2025') {
          return res.code(404).send(ERROR_CODE[ 'UE009' ])
        }
        return res.code(500).send(ERROR_CODE[ 'UE006' ])
      })
  })

  done()
})

module.exports = plugin