const _ = require('lodash')
const { set, format } = require('date-fns')
const { transformLogData, transformReportData} = require('./log2.js')

const defaultMiddie = (app, req, res, ERROR_CODE, SUCCESS_CODE) => {
  const create = async (employee) => {
    // get current date and time
    const date = new Date(Date.now())
    const date_begin = new Date(date.setHours(0, 0, 0, 0))
    const date_end = new Date(date.setHours(23, 59, 59, 999))
    const time = date.getTime()

    // get schedule from employee
    const schedule = employee.schedule

    // get all user logs from with employee id and begin date and end date
    const userTodayLogs = await app.prisma.logs.findMany({
      where: {
        employee: employee.id,
        timestamp: {
          gte: date_begin,
          lte: date_end
        }
      }
    })
      .then(e => {
        const data = []
        for (let log of e) {
          data.push({
            ..._.omit(log, [ 'data' ]),
            ...(typeof log.data === 'string' ? JSON.parse(log.data) : log.data)
          })
        }
        return data
      })

    // get time code from date (AM|PM)
    employee.time_code = format(date, 'a')

    if (employee.has_schedule && userTodayLogs.length === 0 && employee.time_code === 'AM') {
      // AM RANGE BASE ON EMPLOYEE SCHEDULE
      const AM = new Date(schedule[ 0 ] && schedule[ 0 ] > 0 ? set(schedule[ 0 ], {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate()
      }) : (new Date(Date.now())).setHours(0, 0, 0, 0))

      // PM RANGE BASE ON EMPLOYEE SCHEDULE
      const PM = new Date(schedule[ 1 ] && schedule[ 1 ] > 0 ? set(schedule[ 1 ], {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate()
      }) : (new Date(Date.now())).setHours(23, 59, 59, 999))

      // get grace period, in minutes
      const grace_period = await app.prisma.system.findUnique({
        where: {
          key: 'grace_period'
        }
      })
        .then(e => JSON.parse(e.value))
        .catch(() => 15)

      // check if date is between AM and AM + grace period
      if (time >= AM.getTime() && time <= (AM.getTime() + grace_period * 60000)) {
        employee.morning_remarks = 'grace_period'
      }

      // check if early in
      if (time < AM.getTime()) {
        employee.morning_remarks = 'early'
      }

      // else if late
      else if (time > PM.getTime()) {
        employee.morning_remarks = 'late'
      }
    }

    // iterate through user logs
    let UAML = 0 // User AM Logs
    let UPML = 0 // User PM Logs
    for (let log of userTodayLogs) {
      // get log time
      if (log.time_code === 'AM') {
        UAML++
      } else if (log.time_code === 'PM') {
        UPML++
      }
    }

    if (employee.time_code === 'AM') {
      UAML++
    } else if (employee.time_code === 'PM') {
      UPML++
    }

    // if AM
    if (employee.time_code === 'AM') {
      if (UAML == 1) {
        // set employee.time_sigm to IN
        employee.time_sigm = 'IN'
      } else if (UAML == 2) {
        // set employee.time_sigm to OUT
        employee.time_sigm = 'OUT'
      } else {
        // throw error, duplicate logs
        return res.code(403).send(ERROR_CODE[ 'LE008' ])
      }
    } else if (employee.time_code === 'PM') {
      if (UPML == 1) {
        // set employee.time_sigm to IN
        employee.time_sigm = 'IN'
      } else if (UPML == 2) {
        // set employee.time_sigm to OUT
        employee.time_sigm = 'OUT'
      } else {
        // throw error, duplicate logs
        return res.code(403).send(ERROR_CODE[ 'LE008' ])
      }
    }


    const log = await app.prisma.logs.create({
      data: {
        employee: employee.id,
        data: JSON.stringify(
          _.omit(employee, [ 'id', 'addedBy' ])
        )
      }
    })

    const ress = {
      ..._.omit(log, [ 'data' ]),
      ...Object.create(JSON.parse(log.data))
    }

    return res.code(200).send({
      ...SUCCESS_CODE[ 'LS001' ],
      data: ress
    })
  }

  const reads = async () => {

    // get all possible logs filter
    const { from, to, date } = req.body

    const range = [ null, null ]

    // easy way to get range
    if (date) {
      range[ 0 ] = new Date(new Date(date).setHours(0, 0, 0, 0))
      range[ 1 ] = new Date(new Date(date).setHours(23, 59, 59, 999))
    }

    // advanced way to get range
    if (from && to) {
      range[ 0 ] = new Date(from)
      range[ 1 ] = new Date(to)
    }

    // check range values if are all valid date
    if (!range[ 0 ] || !range[ 1 ] || range[ 0 ].getTime() > range[ 1 ].getTime()) {
      return res.code(403).send(ERROR_CODE[ 'LE007' ])
    }

    // get all logs from range
    const logs = await app.prisma.logs.findMany({
      where: {
        timestamp: {
          gte: range[ 0 ],
          lte: range[ 1 ]
        }
      }
    })
      .then(e => transformLogData(e))

    return res.code(200).send({
      ...SUCCESS_CODE[ 'LS002' ],
      data: logs
    })
  }

  const reports = async () => {
    // get all possible logs filter
    const { from, to, date } = req.body

    const range = [ null, null ]

    // easy way to get range
    if (date) {
      range[ 0 ] = new Date(new Date(date).setHours(0, 0, 0, 0))
      range[ 1 ] = new Date(new Date(date).setHours(23, 59, 59, 999))
    }

    // advanced way to get range
    if (from && to) {
      range[ 0 ] = new Date(from)
      range[ 1 ] = new Date(to)
    }

    // check range values if are all valid date
    if (!range[ 0 ] || !range[ 1 ] || range[ 0 ].getTime() > range[ 1 ].getTime()) {
      return res.code(403).send(ERROR_CODE[ 'LE007' ])
    }

    // get all logs from range
    const logs = await app.prisma.logs.findMany({
      where: {
        timestamp: {
          gte: range[ 0 ],
          lte: range[ 1 ]
        }
      }
    })
      .then(e => transformReportData(e))

    return res.code(200).send({
      ...SUCCESS_CODE[ 'LS002' ],
      data: logs
    })
  }

  return {
    create,
    reads,
    reports
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