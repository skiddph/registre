const bcrypt = require('bcrypt');

module.exports = function(app, base_url) {
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