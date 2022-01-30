module.exports =  function(app, base_url) {
  const handler = async (req, res) => {
    const user = await app.prisma.user.count({});
    const admin = await app.prisma.user.count({ where: { role: 2 } });
    const superadmin = await app.prisma.user.count({ where: { role: 1 } });
    return res.send({ user, admin, superadmin });
  }
  
  app.get(`${base_url}/usercount`, handler);
}