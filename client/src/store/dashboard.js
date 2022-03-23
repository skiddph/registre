import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  tabs: [],
  data: {},
  active: 'overview',
  search: "",
  result_loading: false,
  result: [],
  result_headers: [],
  addform: false
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
    active({ commit, dispatch }, tab) {
      commit('active', String(tab).toLowerCase())
      dispatch('search', "")
    },
    search({ commit, state }, search) {
      commit('search', search)
      let result = _.filter(state.data[ state.active ], (item) => {
        if (!search) return true
        if (typeof item != "string") {
          let hasMatch = false
          Object.keys(item).forEach(f => {
            if (!hasMatch)
              hasMatch = typeof item[ f ] == "string" ?
                _.includes(String(item[ f ]).toLowerCase(), search.toLowerCase()) :
                _.includes(item[ f ], search)
          })
          return hasMatch
        } else {
          return _.includes(String(item).toLowerCase(), search.toLowerCase())
        }
      })
      commit('result', result)
      if (typeof result[ 0 ] == "string") {
        commit('result_headers', [ "value" ])
      } else {
        commit('result_headers', _.keys(result[ 0 ]))
      }
    },
    async data({ commit, state, rootState, dispatch }, key) {
      if (key == 'admins') {
        commit('data', { ..._.omit(state.data, [ key ]), admins: rootState.user.users })
      } else if (key == 'employees') {
        await dispatch('employee/get', null, { root: true })
        commit('data', { ..._.omit(state.data, [ key ]), employees: rootState.employee.employees })
      } else if (key == 'overview') {
        await dispatch('logs/report', null, { root: true })
        const data = _.map(rootState.logs.report, (item) => {
          return {
            ..._.omit(item, ['remarks']),
            undertime: item.remarks?.undertime || 0,
            late: item.remarks?.late || 0,
          }
        })
        commit('data', { ..._.omit(state.data, [ key ]), overview: data})
      } else if (rootState.system[ key ]) {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: rootState.system[ key ] })
      } else {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: [] })
      }
    }
  }
}

export default module