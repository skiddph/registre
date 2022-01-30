module.exports = function(app, base_url) {
  app.get(`${base_url}/office/:office`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { office } = req.params;
    const data = await app.prisma.office.create({ data: { name: office } });
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to create office' });
  })

  app.delete(`${base_url}/office/:office`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { office } = req.params;
    const deletedOffice = await app.prisma.office.delete({
      where: { name: office }
    })
    if (deletedOffice) return res.send({ name: deletedOffice.name });
    else return res.code(500).send({ error: 'Failed to delete office' });
  })

  app.get(`${base_url}/offices`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const data = await app.prisma.office.findMany();
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to get offices' });
  })
}