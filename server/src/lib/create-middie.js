const _ = require('lodash')
const { format } = require('date-fns')

const defaultMiddie = (app, req, res, ERROR_CODE, SUCCESS_CODE) => {
  const create = async (employee) => {
    // get current date and time
    const date = new Date(Date.now())
    const time = date.getTime()

    // get schedule from employee
    const schedule = employee.schedule

    const AM = (new Date(schedule[0] || Date.now())).setHours(0, 0, 0, 0)
    const PM = (new Date(schedule[1] || Date.now())).setHours(23, 59, 59, 999)

    console.log(AM, PM)

    const log = await app.prisma.logs.create({
      data: {
        employee: employee.id,
        data: JSON.stringify(employee)
      }
    })

    const ress = {
      ..._.omit(log, [ 'data' ]),
      ...Object.create(JSON.parse(log.data))
    }

    console.log(ress)

    return res.code(200).send({
      ...SUCCESS_CODE[ 'LS001' ],
      data: ress
    })
  }

  return {
    create
  }
}

const createMiddie = function (middleware) {
  try {
    if (typeof middleware.log === 'function') {
      return middleware.log
    }
    return defaultMiddie
  } catch (e) {
    return defaultMiddie
  }
}

module.exports = createMiddie