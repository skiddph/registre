import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
import { format } from 'date-fns'
const DEFAULT_STATE = {
  logs: [],
  logs_range: [],
  logs_result: [],
  report: [],
  report_range: [],
  report_result: []
}

const module = {
  namespaced: true,
  state: () => Object.assign({}, DEFAULT_STATE),
  mutations: {
    ...createMutations(DEFAULT_STATE),
    // addtional mutations here
  },
  actions: {
    reset: createResetAction(DEFAULT_STATE),
    report_range({ commit }) {
      const m = new Date()
      m.setDate(m.getDate() - 30)
      m.setHours(0, 0, 0, 0)
      const t = new Date()
      t.setHours(23, 59, 59, 999)
      commit('report_range', [ m.getTime(), t.getTime() ])
    },
    logs_range({ commit }) {
      const m = new Date()
      m.setHours(0, 0, 0, 0)
      const t = new Date()
      t.setHours(23, 59, 59, 999)
      commit('logs_range', [ m.getTime(), t.getTime() ])
    },
    async report({ commit, rootState, state, dispatch }) {
      if (!state.report_range[ 0 ]) dispatch('report_range')
      await fetch(`${rootState.api_url}/logs/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: state.report_range[ 0 ],
          to: state.report_range[ 1 ]
        })
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('report', e.data)
          return e
        })
    },
    async get({ commit, rootState, state, dispatch }) {
      if (!state.logs_range[ 0 ]) dispatch('logs_range')
      await fetch(`${rootState.api_url}/logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: state.logs_range[ 0 ],
          to: state.logs_range[ 1 ]
        })
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) {
            const data = []
            e.data.forEach(item => {
              data.push({
                ..._.omit(item, [ 'timestamps' ]),
                AM_IN: item.timestamps.AM_IN ? format(new Date(item.timestamps.AM_IN), "h:mm") : "-",
                AM_OUT: item.timestamps.AM_OUT ? format(new Date(item.timestamps.AM_OUT), "h:mm") : "-",
                PM_IN: item.timestamps.PM_IN ? format(new Date(item.timestamps.PM_IN), "h:mm") : "-",
                PM_OUT: item.timestamps.PM_OUT ? format(new Date(item.timestamps.PM_OUT), "h:mm") : "-",
                date: format(new Date(item.timestamps.AM_IN || item.timestamps.AM_OUT || item.timestamps.PM_IN || item.timestamps.PM_OUT), "MMM dd, yyyy")
              })
            })
            commit('logs', data)
          }
          return e
        })
    },
    async create({ rootState }, id) {
      return await fetch(`${rootState.api_url}/log`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
        .then(e => e.json())
    }
  }
}

export default module