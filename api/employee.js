module.exports = function (app, base_url) {
  app.get(`${base_url}/employees`, {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              office: { type: 'string' },
              unit: { type: 'string' },
              position: { type: 'string' }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    },
  }, async (req, res) => {
    req.user = await getUserFromToken(req);
    if (!req.user) return res.code(401).send({ error: 'Unauthorized' });
    return res.send(await app.prisma.employee.findMany({}));
  })
}