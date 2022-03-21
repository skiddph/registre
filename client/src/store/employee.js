import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  employees: []
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
    async get({ commit, rootState }) {
      await fetch(`${rootState.api_url}/employees`, {
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`
        }
      }) 
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('employees', e.data)
          return e
        })
    }
  }
}

export default module