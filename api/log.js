const _ = require('lodash')

module.exports = function (app, base_url) {
  app.post(`${base_url}/log`, async (req, res) => {
    const { id } = req.body;

    if (!id) return res.code(400).send({ error: 'Bad request' });

    const logs = await app.prisma.logs.findMany({
      where: {
        employee: id,
        isOut: false
      }
    });

    if (logs.length > 0) {
      return await app.prisma.logs.update({
        where: {
          id: logs[ 0 ].id,
        },
        data: {
          isOut: true,
          out: Date.now()
        }
      })
    } else {
      const employee = await app.prisma.employee.findUnique({ where: { id } })
        .catch(err => {
          console.log(err)
          return res.code(500).send({ error: 'Failed to find employee' })
        })
      if (!employee) return res.code(404).send({ error: 'Employee not found' });

      return await app.prisma.logs.create({
        data: {
          employee: employee.id,
          name: employee.name,
          office: employee.office,
          unit: employee.unit,
          position: employee.position,
          in: Date.now(),
        }
      })
        .then(log => {
          return res.send({ id: log.id })
        })
        .catch(err => {
          console.log(err)
          return res.code(500).send({ error: 'Failed to create log' })
        })
    }
  })

  const getDate = (dt) => {
    const { year, month, day, hour, minute, second, ms } = dt
    const d = new Date()
    d.setFullYear(year, month, day)
    d.setHours(hour, minute, second, ms)
    return new Date(d).getTime()
  }

  app.post(`${base_url}/logs`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' })
    const { from, to, id, unit, office, position, name } = req.body
    if (!from || !to) return res.code(500).send({ error: "requires 'from' and 'to' fields" })
    from.second = from?.second || 0
    from.ms = from?.ms || 0
    to.second = to?.second || 59
    to.ms = to?.ms || 999

    const query = {
      where: {
        in: {
          gt: getDate(from),
          lt: getDate(to)
        }
      }
    }

    if (id) query.where.id = id
    if (unit) query.where.unit = unit
    if (office) query.where.office = office
    if (position) query.where.position = position
    if (name) query.where.name = name
    
    return await app.prisma.logs.findMany(query)
  })
}