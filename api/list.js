const _ = require('lodash')

module.exports = function (app, base_url) {
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