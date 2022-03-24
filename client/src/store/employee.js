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
    },
    delete({ commit, rootState, state }, id) {
      return fetch(`${rootState.api_url}/employee/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`
        }
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('employees', _.filter(state.employees, { id: e.data.id }))
          return e
        })
    },
    async create({ commit, rootState, state }, formdata) {
      return await fetch(`${rootState.api_url}/employee`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formdata)
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('employees', [ ...state.employees, _.omit(e.data, [ 'hash' ]) ])
          return e
        })
    },
    async update({ commit, rootState, state }, formdata) {
      return await fetch(`${rootState.api_url}/employee/${formdata.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${rootState.user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(_.omit(formdata, [ 'id' ]))
      })
        .then(e => e.json())
        .then(e => {
          if (e.data) commit('employees', _.map(state.employees, (e) => {
            if (e.id === formdata.id) return _.omit(e.data, [ 'hash' ])
            return e
          }))
          return e
        })
    }
  }
}

export default module