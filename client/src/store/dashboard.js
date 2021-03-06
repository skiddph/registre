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
  addform: false,
  editform: false,
  formdata: {}
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
        const admins = await dispatch('user/get', null, { root: true })
        commit('data', { ..._.omit(state.data, [ key ]), admins: rootState.user.users })
        return admins
      } else if (key == 'employees') {
        const employees = await dispatch('employee/get', null, { root: true })
        commit('data', { ..._.omit(state.data, [ key ]), employees: rootState.employee.employees })
        return employees
      } else if (key == 'overview') {
        const overview = await dispatch('logs/report', null, { root: true })
        const data = _.map(rootState.logs.report, (item) => {
          return {
            ..._.omit(item, [ 'remarks' ]),
            undertime: item.remarks?.undertime || 0,
            late: item.remarks?.late || 0,
          }
        })
        commit('data', { ..._.omit(state.data, [ key ]), overview: data })
        return overview
      } else if (key == "logs") {
        const logs = await dispatch('logs/get', { from: "", to: "" }, { root: true })
        commit('data', { ..._.omit(state.data, [ key ]), logs: rootState.logs.logs })
        return logs
      } else if (rootState.system[ key ]) {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: rootState.system[ key ] })
        return Object.assign({}, rootState.system[ key ])
      } else {
        commit('data', { ..._.omit(state.data, [ key ]), [ key ]: [] })
      }
    },
    editform({ commit }, item) {
      commit('editform', true)
      commit('formdata', Object.assign({}, item))
    },
    cancelform({ commit }) {
      commit('addform', false)
      commit('editform', false)
      commit('formdata', {})
    },
    async updatedata({ state, dispatch }) {
      if (state.active == 'employees') {
        const data = _.pick(Object.assign({}, state.formdata), [ 'name', 'id' ])
        data.dropdown_fields = _.omit(Object.assign({}, state.formdata), [ 'name', 'id' ])
        return await dispatch('employee/update', data, { root: true })
          .then(async e => {
            if (e.status == "success") {
              await dispatch('employee/get', null, { root: true })
              await dispatch('data', state.active)
              const search = String(state.search)
              dispatch('search', '')
              dispatch('search', search)
            }
            return e
          })
      } else if (state.active == 'admins') {
        return await dispatch('user/update', Object.assign({}, state.formdata), { root: true })
          .then(async e => {
            if (e.status == "success") {
              await dispatch('user/get', null, { root: true })
              await dispatch('data', state.active)
              const search = String(state.search)
              dispatch('search', '')
              dispatch('search', search)
            }
            return e
          })
      }
    },
    async adddata({ state, dispatch }) {
      if (state.active == 'employees') {
        const data = _.pick(Object.assign({}, state.formdata), [ 'name', 'id' ])
        data.dropdown_fields = _.omit(Object.assign({}, state.formdata), [ 'name', 'id' ])
        return await dispatch('employee/create', data, { root: true })
          .then(async e => {
            if (e.status == "success") {
              await dispatch('employee/get', null, { root: true })
              await dispatch('data', state.active)
              const search = String(state.search)
              dispatch('search', '')
              dispatch('search', search)
            }
            return e
          })
      } else if (state.active == 'admins') {
        return await dispatch('user/create', Object.assign({}, state.formdata), { root: true })
          .then(async e => {
            if (e.status == "success") {
              await dispatch('user/get', null, { root: true })
              await dispatch('data', state.active)
              const search = String(state.search)
              dispatch('search', '')
              dispatch('search', search)
            }
            return e
          })
      }
    },
    async addfielddata({ commit, state, dispatch }, field) {
      const fields = state.data[ state.active ]
      fields.push(field)
      return await dispatch('system/upsert', { key: state.active, value: fields }, { root: true })
        .then(async e => {
          if (e.status == "success") {
            commit('data', { ..._.omit(state.data, [ state.active ]), [ state.active ]: fields })
            await dispatch('system/get', false, { root: true })
            await dispatch('system/get', true, { root: true })
            await dispatch('data', state.active)
            const search = String(state.search)
            dispatch('search', '')
            dispatch('search', search)
          }
          return e
        })
    },
    async deletefielddata({ commit, state, dispatch }, id) {
      if (state.tabs.includes(state.active)) {
        const fields = state.data[ state.active ]
        fields.splice(id, 1)
        return await dispatch('system/upsert', { key: state.active, value: fields }, { root: true })
          .then(async e => {
            if (e.status == "success") {
              commit('data', { ..._.omit(state.data, [ state.active ]), [ state.active ]: fields })
              await dispatch('system/get', false, { root: true })
              await dispatch('system/get', true, { root: true })
              await dispatch('data', state.active)
              const search = String(state.search)
              dispatch('search', '')
              dispatch('search', search)
            }
            return e
          })
      } else {
        if (state.active == 'employees') {
          return await dispatch('employee/delete', id, { root: true })
            .then(async e => {
              if (e.status == "success") {
                await dispatch('employee/get', null, { root: true })
                await dispatch('data', state.active)
                const search = String(state.search)
                dispatch('search', '')
                dispatch('search', search)
              }
              return e
            })
        } else if (state.active == 'admins') {
          return await dispatch('user/delete', id, { root: true })
            .then(async e => {
              if (e.status == "success") {
                await dispatch('user/get', null, { root: true })
                await dispatch('data', state.active)
                const search = String(state.search)
                dispatch('search', '')
                dispatch('search', search)
              }
              return e
            })
        } else {
          return {
            status: "error",
            message: "Unknown error occured"
          }
        }
      }
    }
  }
}

export default module