import { createMutations, createResetAction } from './lib'
import _ from 'lodash'
const DEFAULT_STATE = {
  users: [],
  token: "",
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
          if (!state.token) commit('token', e.token || "")
          if (e.data) commit('users', [ ...state.users, _.omit(e.data, [ 'hash' ]) ])
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
          commit('token', e.token || "")
          console.log(state.token)
          return e
        })
    },
    async update({ commit, rootState, state }, { id, user, name, role, pass }) {
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
          if (e.token) commit('token', e.token || "")
          if (e.data) commit('users', _.map(state.users, (e) => e.id == id ? _.omit(e, [ 'hash' ]) : e))
          return e
        })
    },
    async delete({ commit, rootState, state }, id) {
      return await fetch(`${rootState.api_url}/user/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
      })
        .then(e => e.json())
        .then(e => {
          if (e.token) commit('token', e.token || "")
          if (e.data) commit('users', _.filter(state.users, (e) => e.id != id))
          return e
        })
    },
    async get({ commit, rootState, state }) {
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
          return e
        })
    }
  }
}

export default module