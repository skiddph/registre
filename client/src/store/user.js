import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  users: [],
  token: "",
  role: 0,
  sac: 0, // super admin count
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
    async sac({ commit, state }) {
      const { users } = state
      const sac = _.filter(users, { role: 1 }).length
      commit('sac', sac)
    },
    async create({ commit, rootState, state, dispatch }, { user, name, role, pass }) {
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
          if (!state.token) {
            commit('token', e.token || "")
            commit('role', e.data.role || 0)
          }
          if (e.data) commit('users', [ ...state.users, _.omit(e.data, [ 'hash' ]) ])
          dispatch('sac')
          return e
        })
    },
    async login({ commit, rootState, state }, { user, pass }) {
      return await fetch(`${rootState.api_url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, pass })
      })
        .then(e => e.json())
        .then(e => {
          if (e.token) {
            commit('token', e.token || "")
            commit('role', e.data.role || 0)
          }
          return e
        })
    },
    async update({ commit, rootState, state, dispatch }, { id, user, name, role, pass }) {
      return await fetch(`${rootState.api_url}/user/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ user, name, role, pass })
      })
        .then(e => e.json())
        .then(e => {
          if (e.token) {
            commit('token', e.token || "")
            commit('role', e.data.role || 0)
          }

          if (e.data) commit('users', _.map(state.users, (e) => e.id == id ? _.omit(e, [ 'hash' ]) : e))
          dispatch('sac')
          return e
        })
    },
    async delete({ commit, rootState, state, dispatch }, id) {
      return await fetch(`${rootState.api_url}/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
      })
        .then(e => e.json())
        .then(e => {
          if (e.data.id == id) dispatch('reset')
          if (e.data) commit('users', _.filter(state.users, (e) => e.id != id))
          dispatch('sac')
          return e
        })
    },
    async get({ commit, rootState, state, dispatch }) {
      return await fetch(`${rootState.api_url}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('users', e.data)
          dispatch('sac')
          return e
        })
    }
  }
}

export default module