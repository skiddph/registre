const transformEmployeeData = async (app, data) => {
  data.data = typeof data.data === 'string' ? JSON.parse(data.data) : data.data

  const dropdown_fields = await app.prisma.system.findUnique({
    where: {
      key: 'dropdown_fields'
    }
  })
    .then(e => JSON.parse(e.value))
  
  if(!data.data?.schedule){
    data.data.schedule = await app.prisma.system.findUnique({
      where: {
        key: 'fallback_schedule'
      }
    })
      .then(e => JSON.parse(e.value))
      .catch(() => []);
  }

  for (let field of dropdown_fields) {
    data[ field ] = data.data[ field ] || null
  }

  // if schedule field is empty, set it to fallback schedule
  if (!data.schedule) {
    data.schedule = data.data.schedule
  }

  delete data.data
  console.log('log2data',data)
  return data
}


module.exports = {
  transformEmployeeData
}