const Fastify = require('fastify');
const { PrismaClient } = require('@prisma/client');
const _ = require("lodash");
const USID = require('usid');
const path = require('path');
const fs = require('fs');
const net = require('./lib/net');
const fp = require('fastify-plugin')
const bcrypt = require('bcrypt');
const dt = require('./lib/datetime')
const Logs = require('./lib/logs')

require('dotenv').config();

const create = function (app, base_url) {
  // Create User
  app.post(`${base_url}/user`, {
    schema: {
      body: {
        type: 'object',
        required: [ 'name', 'user', 'pass' ],
        properties: {
          name: { type: 'string' },
          user: { type: 'string' },
          pass: { type: 'string' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            token: { type: 'string' },
            name: { type: 'string' },
            user: { type: 'string' },
            role: { type: 'number' }
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (req, res) => {
    const role = await app.prisma.user.count({ where: { role: 1 } }) === 0 ? 1 : 2;
    if (role !== 1) {
      if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    }

    const { name, user, pass } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pass, salt);

    const data = await app.prisma.user.create({ data: { name, user, hash, role } })
      .catch(e => {
        if (e.code === 'P2002') return res.code(409).send({ error: 'User already exists' })
        return res.code(500).send({ error: e.message })
      })
    if (data) {
      const token = await app.jwt.sign({ user: data.id });
      res.send({ token, ...data });
    } else return res.code(500).send({ error: 'Failed to register user' });
  });

  // Create Employee
  app.post(`${base_url}/employee`, {
    schema: {
      body: {
        type: 'object',
        required: [ 'name', 'office', 'unit', 'position', 'id' ],
        properties: {
          name: { type: 'string' },
          office: { type: 'string' },
          unit: { type: 'string' },
          position: { type: 'string' },
          id: { type: 'string' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { name, office, unit, position, id } = req.body;
    const data = await app.prisma.employee.create({ data: { name, office, unit, position, id } })
      .catch(e => {
        if (e.code === 'P2002') return res.code(409).send({ error: 'Employee already exists' })
        return res.code(500).send({ error: e.message })
      })
    if (data) {
      res.send(data);
    } else return res.code(500).send({ error: 'Failed to create employee' });
  })

  // options for office, unit and position
  const opts1 = {
    schema: {
      body: {
        type: 'object',
        required: [ 'name' ],
        properties: {
          name: { type: 'string' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }

  // Create Office
  app.post(`${base_url}/office`, opts1, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { name } = req.body;
    const data = await app.prisma.office.create({ data: { name } })
      .catch(e => {
        if (e.code === 'P2002') return res.code(409).send({ error: 'Office already exists' })
        return res.code(500).send({ error: e.message })
      })
    if (data) {
      res.send(data);
    } else return res.code(500).send({ error: 'Failed to create office' });
  })

  // Create Unit
  app.post(`${base_url}/unit`, opts1, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { name } = req.body;
    const data = await app.prisma.unit.create({ data: { name } })
      .catch(e => {
        if (e.code === 'P2002') return res.code(409).send({ error: 'Unit already exists' })
        return res.code(500).send({ error: e.message })
      })
    if (data) {
      res.send(data);
    } else return res.code(500).send({ error: 'Failed to create unit' });
  })

  // Create Position
  app.post(`${base_url}/position`, opts1, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { name } = req.body;
    const data = await app.prisma.position.create({ data: { name } })
      .catch(e => {
        if (e.code === 'P2002') return res.code(409).send({ error: 'Position already exists' })
        return res.code(500).send({ error: e.message })
      })
    if (data) {
      res.send(data);
    } else return res.code(500).send({ error: 'Failed to create position' });
  })
}

const remove = function (app, base_url) {
  // Delete User
  app.delete(`${base_url}/user/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const deletedUser = await app.prisma.user.delete({
      where: { id: Number(id) }
    })
    if (deletedUser) return res.send({ id: deletedUser.id });
    else return res.code(500).send({ error: 'Failed to delete user' });
  })

  // Delete Employee
  app.delete(`${base_url}/employee/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const deletedEmployee = await app.prisma.employee.delete({
      where: { id}
    })
    if (deletedEmployee) return res.send({ id: deletedEmployee.id });
    else return res.code(500).send({ error: 'Failed to delete employee' });
  })

  // Delete Office
  app.delete(`${base_url}/office/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const deletedOffice = await app.prisma.office.delete({
      where: { id: Number(id)}
    })
    if (deletedOffice) return res.send({ name: deletedOffice.name });
    else return res.code(500).send({ error: 'Failed to delete office' });
  })

  // Delete Unit
  app.delete(`${base_url}/unit/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const deletedUnit = await app.prisma.unit.delete({
      where: { id: Number(id) }
    })
    if (deletedUnit) return res.send({ name: deletedUnit.name });
    else return res.code(500).send({ error: 'Failed to delete unit' });
  })

  // Delete Position
  app.delete(`${base_url}/position/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const deletedPosition = await app.prisma.position.delete({
      where: { id: Number(id) }
    })
    if (deletedPosition) return res.send({ name: deletedPosition.name });
    else return res.code(500).send({ error: 'Failed to delete position' });
  })
}

const update = function (app, base_url) {
  // Update User
  app.put(`${base_url}/user/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name, user, role, pass } = req.body;

    const data = {}

    if (name) data.name = name;
    if (user) data.user = user;
    if (role) data.role = role;

    if (pass) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pass, salt);
      data.hash = hash;
    }

    const updatedUser = await app.prisma.user.update({
      where: { id: Number(id) },
      data
    })
    if (updatedUser) return res.send({ id: updatedUser.id });
    else return res.code(500).send({ error: 'Failed to update user' });
  })

  // Update Employee
  app.put(`${base_url}/employee/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id : user_old_id} = req.params;
    const { name, id, office, unit, position } = req.body;
    
    const data = {}

    if(name) data.name = name;
    if(id) data.id = id;
    if(office) data.office = office;
    if(unit) data.unit = unit;
    if(position) data.position = position;

    const updatedEmployee = await app.prisma.employee.update({
      where: { id: user_old_id },
      data
    })
    if (updatedEmployee) return res.send({ id: updatedEmployee.id });
    else return res.code(500).send({ error: 'Failed to update employee' });
  })

  // Update Office
  app.put(`${base_url}/office/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedOffice = await app.prisma.office.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedOffice) return res.send({ name: updatedOffice.name });
    else return res.code(500).send({ error: 'Failed to update office' });
  })

  // Update Unit
  app.put(`${base_url}/unit/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedUnit = await app.prisma.unit.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedUnit) return res.send({ name: updatedUnit.name });
    else return res.code(500).send({ error: 'Failed to update unit' });
  })

  // Update Position
  app.put(`${base_url}/position/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedPosition = await app.prisma.position.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedPosition) return res.send({ name: updatedPosition.name });
    else return res.code(500).send({ error: 'Failed to update position' });
  })
}

const login = function(app, base_url) {
  const opts = {
    schema: {
      body: {
        type: 'object',
        required: [ 'user', 'pass' ],
        properties: {
          user: { type: 'string' },
          pass: { type: 'string' },
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            token: { type: 'string' },
            name: { type: 'string' },
            user: { type: 'string' },
            role: { type: 'number' }
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }

  const handler =  async (req, res) => {
    const { user, pass } = req.body;
    const data = await app.prisma.user.findUnique({ where: { user: String(user) } })
    if (!data) return res.code(401).send({ error: 'User not found' });
    const valid = await bcrypt.compare(pass, data.hash);
    if (valid) {
      const token = await app.jwt.sign({ user: data.id });
      return res.send({ token, ...data });
    } else return res.code(500).send({ error: 'Invalid credentials' });
  }

  app.post(`${base_url}/login`, opts, handler);
}

const list = function (app, base_url) {
  app.get(`${base_url}/list`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { role } = req.user;
    if (!(role === 1 || role === 2)) return res.code(401).send({ error: 'Unauthorized role' });
    const employees = await app.prisma.employee.findMany({})
    const offices = await app.prisma.office.findMany({})
    const units = await app.prisma.unit.findMany({})
    const positions = await app.prisma.position.findMany({})
    let admins = role == 1 ? await app.prisma.user.findMany() : []
    admins = admins.map(admin => _.omit(admin, ['hash']))

    return await res.send({
      offices,
      units,
      positions,
      employees,
      admins
    })
  })

  app.get(`${base_url}/usercount`, async (req, res) => {
    const user = await app.prisma.user.count({});
    const admin = await app.prisma.user.count({ where: { role: 2 } });
    const superadmin = await app.prisma.user.count({ where: { role: 1 } });
    return res.send({ user, admin, superadmin });
  });
}

const log = function (app, base_url) {
  app.post(`${base_url}/log`, async (req, res) => {
    const { id } = req.body;
    if (!id) return res.code(400).send({ error: 'Bad request' });
    const range = dt.getRange();
    const logs = await app.prisma.logs.findMany({
      where: {
        employee: id,
        in: {
          gte: range[ 0 ],
          lte: range[ 1 ],
        }
      }
    });

    if (logs.length === 0) {
      const employee = await app.prisma.employee.findUnique({ where: { id } })
        .catch(err => {
          return res.code(500).send({ error: 'Employee not found' })
        })

      if (employee) return await app.prisma.logs.create({
        data: {
          employee: employee.id,
          name: employee.name,
          office: employee.office,
          unit: employee.unit,
          position: employee.position,
          in: Number(Date.now()),
        }
      })
        .then(log => res.code(200).send({ id: log.id, name: log.name }))
        .catch(err => res.code(500).send({ error: 'Failed to create log' }))

      else return res.code(500).send({ error: 'Employee not found' })
    } else if (logs.length === 1 && logs[ 0 ].isOut === false) {
      return await app.prisma.logs.update({
        where: { id: logs[ 0 ].id },
        data: {
          out: Date.now(),
          isOut: true
        }
      })
        .then(log => res.code(200).send(log))
        .catch(err => res.code(500).send({ error: 'Failed to update log' }))
    } else if (logs.length > 1 || (logs.length === 1 && logs[ 0 ].isOut === true)) {
      return res.code(500).send({ error: `Duplicate employee ${range[ 2 ]} log`, name: logs[ 0 ].name })
    } else {
      return res.code(500).send({ error: 'Unknown Error Occur' });
    }
  })

  app.post(`${base_url}/logs`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' })
    const { from, to, id, unit, office, position, name, filter } = req.body
    if (!from || !to) return res.code(500).send({ error: "requires 'from' and 'to' fields" })
    from.second = from?.second || 0
    from.ms = from?.ms || 0
    to.second = to?.second || 59
    to.ms = to?.ms || 999
    const opts = filter || {}

    const query = {
      where: {
        in: {
          gt: dt.getDate(from),
          lt: dt.getDate(to)
        }
      }
    }

    if (id) query.where.id = id
    if (unit) query.where.unit = unit
    if (office) query.where.office = office
    if (position) query.where.position = position
    if (name) query.where.name = name

    return await app.prisma.logs.findMany(query)
      .then(logs => {
        const record = new Logs(logs)
        const result = record.transform(opts)
        return res.code(200).send(result)
      })
      .catch(err => {
        return res.code(500).send({ error: 'Failed to get logs' })
      })
  })
}

const data = function (app, base_url) {
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
    const data = await reset(app)
      .then(e => {
        success: e
      })
    return res.send(data)
  })
}

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

const api = fp(async (app, opts) => {
  const base_url = opts?.url || "/api";

  create(app, base_url);
  remove(app, base_url);
  update(app, base_url);
  login(app, base_url);
  list(app, base_url);
  log(app, base_url);
  data(app, base_url);

  return
},{
  name: 'registre-api',
  fastify: '3.x'
})

async function start(opts = {}) {

	const fastifyOpts = {  }

	if (process.env.NODE_ENV === 'production') {
		fastifyOpts.http2 = true;
		fastifyOpts.https = {
			allowHTTP1: true,
			key: fs.readFileSync(path.resolve(__dirname, './cert/server.key')),
			cert: fs.readFileSync(path.resolve(__dirname, './cert/server.crt')),
		}
	} else {
		fastifyOpts.logger = true
	}

	const usid = new USID();
	const app = Fastify(fastifyOpts);

	if (process.env.NODE_ENV === 'production') app.register(require('fastify-https-redirect'));

	const prisma = new PrismaClient({});

	app.decorate('prisma', prisma);
	if (process.env.NODE_ENV === 'development')  await app.register(require('fastify-cors'), {})
	await app.register(require('fastify-jwt'), { secret: process.env.JWT_SECRET || usid.rand(24) })
	await app.register(api, { prefix: '/api' })
	await app.register(require('fastify-static'), { root: path.join(__dirname, 'dist') })

	app.get('*', async (req, res) => { res.redirect('/') })

	await app.addHook('preValidation', async (req, res) => {
		req.user = null;
		try {
			if (!req.headers.authorization) {
				return
			}
			const token = req.headers.authorization.split(' ')[ 1 ];

			let decoded;

			try {
				decoded = await app.jwt.verify(token);
			} catch (err) {
				return
			}

			req.user = await app.prisma.user.findUnique({ where: { id: decoded.user } })
			req.user = _.omit(req.user, [ 'hash' ])
		} catch (e) {
			console.log(e)
			req.user = null;
		}
	})

	const handler = (err, address) => {
		if (err) {
			console.log('Failed to start server')
			throw err
		}

		const protocol = address.includes('https') ? 'https' : 'http'
		const port = app.server.address().port

		console.log('Server started\n\nLinks:')
		console.log(`\tLocal - ${protocol}://127.0.0.1:${port}/`)
		
		for (let key in net){
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