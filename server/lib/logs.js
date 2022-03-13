const { dayBeginAt, getRange } = require('../lib/datetime')
const { format } = require('date-fns')
const _ = require('lodash')
class Logs {
  logs = []
  constructor(l = []) {
    this.logs = l;
  }
  transform(opts) {
    const res = {}

    for (let log in this.logs) {
      const date = format(new Date(this.logs[ log ].in), 'yyyy-MM-dd')
      if (!res[ date ]) res[ date ] = {}

      const employee = this.logs[ log ].employee
      if (!res[ date ][ employee ]) {
        res[ date ][ employee ] = _.omit(this.logs[ log ], ['isOut', 'out', 'in',"id"])
        res[ date ][ employee ]["am"] = {"in":0, "out":0}
        res[ date ][ employee ]["pm"] = {"in":0, "out":0}
      }

      const range = getRange(this.logs[ log ].in)
      if (range[ 2 ] === 'AM') {
        res[ date ][ employee ]["am"]["in"] = this.logs[ log ].in
        res[ date ][ employee ]["am"]["out"] = this.logs[ log ].out
      } else {
        res[ date ][ employee ]["pm"]["in"] = this.logs[ log ].in
        res[ date ][ employee ]["pm"]["out"] = this.logs[ log ].out
      }
    }
    
    return res
  }
}

module.exports = Logs;