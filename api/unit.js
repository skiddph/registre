module.exports = function(app, base_url) {
  app.get(`${base_url}/unit/:unit`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { unit } = req.params;
    const data = await app.prisma.unit.create({ data: { name: unit } });
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to create unit' });
  })

  app.delete(`${base_url}/unit/:unit`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { unit } = req.params;
    const deletedUnit = await app.prisma.unit.delete({
      where: { name: unit }
    })
    if (deletedUnit) return res.send({ name: deletedUnit.name });
    else return res.code(500).send({ error: 'Failed to delete unit' });
  })

  app.get(`${base_url}/units`, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const data = await app.prisma.unit.findMany();
    if (data) return res.send(data);
    else return res.code(500).send({ error: 'Failed to get units' });
  })
}