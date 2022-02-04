module.exports = function (app, base_url) {
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