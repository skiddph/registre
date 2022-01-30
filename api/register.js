const bcrypt = require('bcrypt');

module.exports = function(app, base_url) {
  const opts = {
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

  const handler = async (req, res) => {
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
  }

  app.post(`${base_url}/register`, opts, handler);
}