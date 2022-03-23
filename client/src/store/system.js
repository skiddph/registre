import { createMutations, createResetAction } from './lib'
const DEFAULT_STATE = {
  dropdown_fields: [],
  servertime: ""
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
    async get({ commit, rootState, state }, useCredentials = false) {
      return await fetch(`${rootState.api_url}/system`, {
        method: 'GET',
        headers: {
          ...(useCredentials ? { 'Authorization': `Bearer ${rootState.user.token}`, } : {}),
        }
      })
        .then(res => res.json())
        .then(res => {
          for (let key in res.data) {
            try {
              res.data[ key ] = res.data[ key ]
              if (DEFAULT_STATE[ key ]) {
                commit(key, res.data[ key ])
              } else {
                commit('set', {key, value: res.data[ key ]})
              }
            } catch (e) {
              console.log(`[System] Failed to add ${key} to state.`)
            }
          }
          commit('dashboard/tabs', state.dropdown_fields, { root: true })
          return res
        })
    },
    async upsert({ commit, rootState }, { key, value, role = null }) {
      // key must be a string and value must be an object
      if (typeof key !== 'string' || typeof value !== 'object') {
        return {
          status: 'error',
          code: 'SE005',
          message: "'key' must be a string and 'value' must be an object"
        }
      }

      value = JSON.stringify(value)
      return await fetch(`${rootState.api_url}/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.user.token}`,
        },
        body: JSON.stringify({ key, value, role }),
      })
        .then(res => res.json())
        .then(res => {
          if (DEFAULT_STATE[ key ]) {
            commit(res.data.key, JSON.parse(res.data.value))
          }
          return res
        })
    },
    async servertime({ commit, rootState }) {
      return await fetch(`${rootState.api_url}/getservertime`)
        .then(res => res.json())
        .then(res => {
          commit('servertime', res.data || "")
          return res
        })
    },
    async delete({ commit, rootState }, key) {
      // key must be a string
      if (typeof key !== 'string') {
        return {
          status: 'error',
          code: 'SE006',
          message: "'key' must be a string"
        }
      }

      return await fetch(`${rootState.api_url}/system`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.user.token}`,
        },
        body: JSON.stringify({ key}),
      })
        .then(res => res.json())
        .then(res => {
          if (DEFAULT_STATE[ key ]) {
            commit(key, DEFAULT_STATE[ key ])
          }
          return res
        })
    }
  }
}

export default module