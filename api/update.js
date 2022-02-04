const bcrypt = require('bcrypt');

module.exports = function (app, base_url) {
  // Update User
  app.put(`${base_url}/user/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name, user, role, pass } = req.body;

    const data = {}

    if (name) data.name = name;
    if (user) data.user = user;
    if (role) data.role = role;

    if (pass) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pass, salt);
      data.hash = hash;
    }

    const updatedUser = await app.prisma.user.update({
      where: { id: Number(id) },
      data
    })
    if (updatedUser) return res.send({ id: updatedUser.id });
    else return res.code(500).send({ error: 'Failed to update user' });
  })

  // Update Employee
  app.put(`${base_url}/employee/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id : user_old_id} = req.params;
    const { name, id, office, unit, position } = req.body;
    
    const data = {}

    if(name) data.name = name;
    if(id) data.id = id;
    if(office) data.office = office;
    if(unit) data.unit = unit;
    if(position) data.position = position;

    const updatedEmployee = await app.prisma.employee.update({
      where: { id: user_old_id },
      data
    })
    if (updatedEmployee) return res.send({ id: updatedEmployee.id });
    else return res.code(500).send({ error: 'Failed to update employee' });
  })

  // Update Office
  app.put(`${base_url}/office/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedOffice = await app.prisma.office.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedOffice) return res.send({ name: updatedOffice.name });
    else return res.code(500).send({ error: 'Failed to update office' });
  })

  // Update Unit
  app.put(`${base_url}/unit/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedUnit = await app.prisma.unit.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedUnit) return res.send({ name: updatedUnit.name });
    else return res.code(500).send({ error: 'Failed to update unit' });
  })

  // Update Position
  app.put(`${base_url}/position/:id`, async (req, res) => {
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.code(400).send({ error: 'Missing name' });

    const updatedPosition = await app.prisma.position.update({
      where: { id: Number(id) },
      data: {
        name
      }
    })

    if (updatedPosition) return res.send({ name: updatedPosition.name });
    else return res.code(500).send({ error: 'Failed to update position' });
  })
}