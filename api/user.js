module.exports = function (app, base_url) {
  app.put(`${base_url}/user`, {
    schema: {
      body: {
        type: 'object',
        required: [ 'id' ],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          user: { type: 'string' },
          pass: { type: 'string' }
        }
      }
    }
  }, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    if (req.user.role !== 1) return res.code(401).send({ error: 'Unauthorized' });
    const { id, name, pass, user } = req.body;
    let hash = ""
    if (pass) {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(pass, salt);
    }
    const updatedUser = await app.prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...((u) => (u ? { user: u } : {}))(user),
        ...((n) => (n ? { name: n } : {}))(name),
        ...((h) => (h ? { hash: h } : {}))(hash)
      }
    })
    if (updatedUser) return res.send({ name: updatedUser.name });
    return res.code(500).send({ error: 'Failed to update user' });
  })

  app.delete(`${base_url}/user`, {
    schema: {
      body: {
        type: 'object',
        required: [ 'id' ],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    if (req.user.role !== 1) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.body;
    const deletedUser = await app.prisma.user.delete({
      where: { id: Number(id) }
    })
    if (deletedUser) return res.send({ name: deletedUser.name });
    return res.code(500).send({ error: 'Failed to delete user' });
  })

  app.get(`${base_url}/users`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    if (req.user.role !== 1) return res.code(401).send({ error: 'Unauthorized' });
    const users = await app.prisma.user.findMany({
      where: {
        id: {
          not: req.user.id
        }
      }
    });
    return users
  })
}