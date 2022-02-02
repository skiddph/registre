const fp = require('fastify-plugin')
const _ = require('lodash')

const api = async (app, opts) => {
  const base_url = opts?.url || "/api";

  require('./usercount')(app, base_url);
  require('./register')(app, base_url);
  require('./login')(app, base_url);
  require('./user')(app, base_url);
  require('./office')(app, base_url);
  require('./unit')(app, base_url);
  require('./position')(app, base_url);
  require('./employee')(app, base_url);

  app.get(`${base_url}/list`, async (req, res) => {
    console.log(req.user)
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { role } = req.user;
    if (!(role === 1 || role === 2)) return res.code(401).send({ error: 'Unauthorized role' });
    const employees = await app.prisma.employee.findMany({})
    const offices = await app.prisma.office.findMany({})
    const units = await app.prisma.unit.findMany({})
    const positions = await app.prisma.position.findMany({})
    let admins = role == 1 ? await app.prisma.user.findMany({ where: {role: 2 } }) : []
    admins = admins.map(admin => _.omit(admin, ['hash']))

    return await res.send({
      offices,
      units,
      positions,
      employees,
      admins
    })
  })

  return
}

module.exports = fp(api, {
  name: 'registre-api',
  fastify: '3.x'
})