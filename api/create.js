const bcrypt = require('bcrypt');

module.exports = function (app, base_url) {
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
        required: [ 'name', 'office', 'unit', 'position' ,'id'],
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