import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  tabs: [],
  data: {},
  active: 'employees',
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
    active({ commit }, tab) {
      commit('active', String(tab).toLowerCase())
    },
    async data({ commit, state, rootState, dispatch }, key) {
      if (key == 'admins') {
        commit('data', { ..._.omit(state.data, [ key ]), admins: rootState.user.users })
      } else if (key == 'employees') {
        await dispatch('employee/get', null, { root: true })
        commit('data', { ..._.omit(state.data, [ key ]), employees: rootState.employee.employees })
      } else if (rootState.system[ key ]) {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: rootState.system[ key ] })
      } else {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: [] })
      }
    }
  }
}

export default module