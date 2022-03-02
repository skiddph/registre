const _ = require('lodash')
const dt = require('../lib/datetime')
const Logs = require('../lib/logs')

module.exports = function (app, base_url) {
  app.post(`${base_url}/log`, async (req, res) => {
    const { id } = req.body;

    if (!id) return res.code(400).send({ error: 'Bad request' });

    const range = dt.getRange();

    const logs = await app.prisma.logs.findMany({
      where: {
        employee: id,
        in: {
          gte: range[ 0 ],
          lte: range[ 1 ],
        }
      }
    });

    console.log('\n>>> logs')

    
    if (logs.length === 0) {
      console.log('\n>>> find employee')
      const employee = await app.prisma.employee.findUnique({ where: { id } })
        .catch(err => {
          console.log(err)
          return res.code(500).send({ error: 'Employee not found' })
        })

      if (employee) return await app.prisma.logs.create({
        data: {
          employee: employee.id,
          name: employee.name,
          office: employee.office,
          unit: employee.unit,
          position: employee.position,
          in: Number(Date.now()),
        }
      })
        .then(log => {
          console.log('\n>>> log created', log)
          return res.code(200).send({ id: log.id, name: log.name })
        })
        .catch(err => {
          console.log(err)
          return res.code(500).send({ error: 'Failed to create log' })
        })

      else return res.code(500).send({ error: 'Employee not found' })
    } else if (logs.length === 1 && logs[ 0 ].isOut === false) {
      console.log('\n>>> update log', logs)
      return await app.prisma.logs.update({
        where: { id: logs[ 0 ].id },
        data: {
          out: Date.now(),
          isOut: true
        }
      })
        .then(log => {
          console.log('\n>>> log updated', log)
          return res.code(200).send(log)
        })
        .catch(err => {
          console.log(err)
          return res.code(500).send({ error: 'Failed to update log' })
        })
    } else if (logs.length > 1 || (logs.length === 1 && logs[ 0 ].isOut === true)) {
      console.log('\n>>> multiple logs', logs)
      return res.code(500).send({ error: `Duplicate employee ${range[2]} log`, name: logs[0].name})
    } else {
      console.log('\n>>> no logs')
      return res.code(500).send({ error: 'Unknown Error Occur' });
    }
  })

  app.post(`${base_url}/logs`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' })
    const { from, to, id, unit, office, position, name , filter} = req.body
    if (!from || !to) return res.code(500).send({ error: "requires 'from' and 'to' fields" })
    from.second = from?.second || 0
    from.ms = from?.ms || 0
    to.second = to?.second || 59
    to.ms = to?.ms || 999
    const opts = filter || {}

    const query = {
      where: {
        in: {
          gt: dt.getDate(from),
          lt: dt.getDate(to)
        }
      }
    }

    if (id) query.where.id = id
    if (unit) query.where.unit = unit
    if (office) query.where.office = office
    if (position) query.where.position = position
    if (name) query.where.name = name

    return await app.prisma.logs.findMany(query)
      .then(logs => {
        const record = new Logs(logs)
        const result = record.transform(opts)
        return res.code(200).send(result)
      })
      .catch(err => {
        return res.code(500).send({ error: 'Failed to get logs' })
      })
  })
}