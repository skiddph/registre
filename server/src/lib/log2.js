const _ = require('lodash')

const transformEmployeeData = async (app, data) => {
  if (!data) return

  data.data = typeof data.data === 'string' ? JSON.parse(data.data) : data.data

  const dropdown_fields = await app.prisma.system.findUnique({
    where: {
      key: 'dropdown_fields'
    }
  })
    .then(e => JSON.parse(e.value))

  data.has_schedule = true

  if (!data.data?.schedule) {
    data.has_schedule = false
    data.data.schedule = await app.prisma.system.findUnique({
      where: {
        key: 'fallback_schedule'
      }
    })
      .then(e => JSON.parse(e.value))
      .catch(() => [ 0, 0 ]);
  }

  for (let field of dropdown_fields) {
    data[ field ] = data.data[ field ] || null
  }

  // if schedule field is empty, set it to fallback schedule
  if (!data.schedule && data.has_schedule) {
    data.schedule = data.data.schedule
  }

  delete data.data
  return data
}

const transformLogData = (data) => {
  /*
    where data = [
      {
        id: Number,
        timestamp: Date,
        data: Object, // JSON
        employee: String,
      }
    ]
  */

  // group by date
  const groupedByDate = _.groupBy(data, (e) => {
    return new Date(e.timestamp).setHours(0, 0, 0, 0)
  })

  const groupedByEmployee = Object.create(null)
  const result = []

  for (let date in groupedByDate) {
    const logs = groupedByDate[ date ]

    // group by employee
    groupedByEmployee[ date ] = _.groupBy(logs, (e) => {
      return e.employee
    })

    // group stamps by employee
    for (let employee in groupedByEmployee[ date ]) {
      const log_code = {
        AM_IN: null,
        AM_OUT: null,
        PM_IN: null,
        PM_OUT: null,
      }
      let log_f = {}
      _.sortBy(groupedByEmployee[ date ][ employee ], 'id', 'asc').map(e => {
        e.data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
        log_code[ `${e.data.time_code}_${e.data.time_sigm}` ] = e.timestamp
        log_f = {
          ...log_f,
          ..._.omit(e, [ 'data', 'timestamp', 'id' ]),
          ..._.omit(e.data, [ 'time_code', 'time_sigm', 'schedule', 'log_remarks']),
          ...(() => {
            const d = {}
            e.data.log_remarks.forEach(e => d[e] = true)
            return d
          })()
        }
      })

      log_f.timestamps = log_code
      if(
        (log_code.AM_IN && log_code.AM_OUT && !log_code.PM_IN && !log_code.PM_OUT) || 
        (!log_code.AM_IN && !log_code.AM_OUT && log_code.PM_IN && log_code.PM_OUT)
      ) {
        log_f.undertime = true
      }

      result.push(log_f)
    }
  }

  return result
}

const transformReportData = (data) => {
  logs = transformLogData(data)
  const result = Object.create(null)

  logs.forEach(e => {
    result[ e.employee ] = _.omit(e, [ 'remarks', 'timestamps', 'has_schedule', 'late', 'grace', 'early', 'late', 'undertime'])
    if (!result[ e.employee ].hasOwnProperty('remarks')) result[ e.employee ].remarks = {
      late: 0,
      undertime: 0,
      grace: 0,
      early: 0,
    }


    if(e.late) result[ e.employee ].remarks.late++
    if(e.grace) result[ e.employee ].remarks.grace++
    if(e.undertime) result[ e.employee ].remarks.undertime++
    if(e.early) result[ e.employee ].remarks.early++

    // if(
    //   (e.timestamps.AM_IN && e.timestamps.AM_OUT && !e.timestamps.PM_IN && !e.timestamps.PM_OUT) ||
    //   (!e.timestamps.AM_IN && !e.timestamps.AM_OUT && e.timestamps.PM_IN && e.timestamps.PM_OUT)
    // ) {
    //   result[ e.employee ].remarks.undertime = result[ e.employee ].remarks.undertime ? result[ e.employee ].remarks.undertime + 1 : 1
    // }

    // if (remarks) {
    //   // increment remarks
    //   result[ e.employee ].remarks[ remarks ] = result[ e.employee ].remarks[ remarks ] ? result[ e.employee ].remarks[ remarks ] + 1 : 1
    // }
  })

  return Object.values(result)
}

module.exports = {
  transformEmployeeData,
  transformLogData,
  transformReportData,
}