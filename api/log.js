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

    if(logs.length > 0) {
      return await app.prisma.logs.update({
        where: { 
          id: logs[0].id,
        },
        data: {
          isOut: true,
          out: Date.now()
        }
      })
    } else {
      const employee = await app.prisma.employee.findUnique({where: { id }})
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

  app.get(`${base_url}/logs`, async (req, res) => {
    return await app.prisma.logs.findMany({
      where: {
        in: {
          gt: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
          lt: new Date(new Date().setHours(23, 59, 59, 999)).getTime()
        }
      }
    })
  })
}