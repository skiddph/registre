module.exports = function(app, base_url) {
  app.get(`${base_url}/position/:position`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { position } = req.params;
    const data = await app.prisma.position.create({ data: { name: position } });
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to create position' });
  })

  app.delete(`${base_url}/position/:position`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { position } = req.params;
    const deletedPosition = await app.prisma.position.delete({
      where: { name: position }
    })
    if (deletedPosition) return res.send({ name: deletedPosition.name });
    else return res.code(500).send({ error: 'Failed to delete position' });
  })

  app.get(`${base_url}/positions`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const data = await app.prisma.position.findMany();
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to get positions' });
  })
}