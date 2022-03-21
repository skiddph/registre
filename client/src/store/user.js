import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  users: [],
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjo4LCJpYXQiOjE2NDc0MDkwODF9.8MsgflWsKiLteotLWtNHF0wtsFQEVxpWJiLUa1e9Tuo",
}

const module = {
  namespaced: true,
  state: () => DEFAULT_STATE,
  mutations: {
    ...createMutations(DEFAULT_STATE),
    // addtional mutations here
  },
  actions: {
    reset: createResetAction(DEFAULT_STATE),
    async create({ commit, rootState, state }, { user, name, role, pass }) {
      return await fetch(`${rootState.api_url}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ user, name, role, pass })
      })
        .then(e => e.json())
        .then(e => {
          commit('users', [ ...state.users, _.omit(e.data, [ 'hash' ]) ])
        })
    },
  }
}

export default module