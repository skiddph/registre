import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
import {} from 'date-fns'
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
    set_default_range({ commit }) {
      const m = new Date()
      m.setDate(m.getDate() - 30)
      m.setHours(0, 0, 0, 0)
      const t = new Date()
      t.setHours(23, 59, 59, 999)
      commit('report_range', [ m.getTime(), t.getTime() ])
    },
    async report({ commit, rootState, state, dispatch}) {
      console.log(state.report_range)
      if(!state.report_range[0]) dispatch('set_default_range')
      console.log(JSON.stringify({
        from: state.report_range[0],
        to: state.report_range[1]
      }))
      await fetch(`${rootState.api_url}/logs/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: state.report_range[0],
          to: state.report_range[1]
        })
      }) 
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('report', e.data)
          return e
        })
    }
  }
}

export default module