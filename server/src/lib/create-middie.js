const _ = require('lodash')
const { set, format } = require('date-fns')
const { transformLogData, transformReportData } = require('./log2.js')

const defaultMiddie = (app, req, res, ERROR_CODE, SUCCESS_CODE) => {
  const create = async (employee) => {
    // get current date and time
    const date = new Date()
    const date_begin = new Date(new Date(date.getTime()).setHours(0, 0, 0, 0))
    const date_end = new Date(new Date(date.getTime()).setHours(23, 59, 59, 999))
    const time = new Date().getTime()

    // get schedule from employee and parse
    const schedule = employee.schedule.split('-').map(time => {
      time = new Date(parseInt(time.trim()))
      return new Date().setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds())
    })

    console.log(format(schedule[0], 'HH:mm'))
    console.log(format(schedule[1], 'HH:mm'))
    console.log(format(new Date(), 'HH:mm'))

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
    employee.time_code = format(new Date(), 'a')

    // employee log remarks
    employee.log_remarks = []
    
    if (employee.has_schedule && userTodayLogs.length === 0 && employee.time_code === 'AM') {
      // AM RANGE BASE ON EMPLOYEE SCHEDULE
      const AM = schedule[0] ? new Date(new Date(schedule[0]).setDate(new Date().getDate())) : new Date(new Date().setHours(0, 0, 0, 0))

      // PM RANGE BASE ON EMPLOYEE SCHEDULE
      const PM = schedule[1] ? new Date(new Date(schedule[1]).setDate(new Date().getDate())) : new Date(new Date().setHours(23, 59, 59, 999))

      // get grace period, in minutes
      // 15mins to timestamp
      const grace_range = [
        AM.getTime(),
        // add 15 mins
        set(AM, { minutes: AM.getMinutes() + 15 }).getTime()
      ]

      // check if time is in grace range
      if (time >= grace_range[0] && time <= grace_range[1]) {
        employee.log_remarks.push('grace')
      }

      // else if late
      else if (time > grace_range[1]) {
        employee.log_remarks.push('late')
      }

      // else if early
      else if (time < grace_range[0]) {
        employee.log_remarks.push('early')
      }

      // else if on time
      else {
        employee.log_remarks.push('error')
      }
    }

    // iterate through user logs
    let UAML = 0 // User AM Logs
    let UPML = 0 // User PM Logs

    // 
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
      ...Object.assign({}, typeof log.data === 'string' ? JSON.parse(log.data) : log.data)
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