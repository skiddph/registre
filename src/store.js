import { createStore } from 'vuex';
const API_URL = import.meta.env.VITE_API_URL || "/api"

const store = createStore({
  state: {
    app: {
      name: "QR Logbook"
    },
    token: '',
    role: 0,
    name: '',
    user: '',
    usercount: 0,
    admincount: 0,
    superadmincount: 0,
    employees: [],
    offices: [],
    units: [],
    positions: [],
    admins: [],
    dash: {
      tabs: [],
      active: 0,
      add: false,
      search: ""
    }
  },
  mutations: {
    setUser(state, { role, name, user, token }) {
      state.role = role
      state.name = name
      state.user = user
      state.token = token
    },
    setUserCount(state, { user, admin, superadmin }) {
      state.usercount = user;
      state.admincount = admin;
      state.superadmincount = superadmin;
    },
    setOffices(state, offices) {
      state.offices = offices;
    },
    setPositions(state, positions) {
      state.positions = positions;
    },
    setUnits(state, units) {
      state.units = units;
    },
    setEmployees(state, employees) {
      state.employees = employees;
    },
    setTabs(state, tabs) {
      state.dash.tabs = tabs
    },
    setActive(state, active) {
      state.dash.active = active
    },
    setAddState(state, add) {
      state.dash.add = add
    },
    setLists(state, { offices, units, positions, employees, admins }) {
      state.offices = offices
      state.units = units
      state.positions = positions
      state.employees = employees
      state.admins = admins
    },
    setSearch(state, search) {
      state.dash.search = search
    }
  },
  actions: {
    async login({ commit }, { user, pass }) {
      return await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user, pass })
      })
        .then(async (e) => await e.json())
        .then(e => {
          commit('setUser', e)
          return e
        })
        .catch(e => ({ error: e.message || e.error }))
    },
    async usercount({ commit }) {
      return await fetch(`${API_URL}/usercount`)
        .then(async (e) => await e.json())
        .then(e => commit('setUserCount', e))
        .catch(e => ({ error: e.message || e.error }))
    },
    async register({ commit, state }, { name, user, pass }) {
      const auth = state.token ? true : false;
      return await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...((auth, token) => (auth ? { 'Authorization': `Bearer ${token}` } : {}))(auth, state.token)
        },
        body: JSON.stringify({ name, user, pass })
      })
        .then(e => e.json())
        .then(e => {
          commit('setUser', e)
          return e
        })
        .catch(e => ({ error: e.message || e.error }))
    },
    logout({ commit }) {
      commit('setUser', {
        token: '',
        role: 0,
        name: '',
        user: ''
      })
    },
    async createOffice({ state, dispatch }, { name }) {
      const auth = state.token ? true : false;
      return await fetch(`${API_URL}/office/${name}`, {
        method: 'GET',
        headers: {
          ...((auth, token) => (auth ? { 'Authorization': `Bearer ${token}` } : {}))(auth, state.token)
        },
      })
        .then(e => e.json())
        .then(async (e) => {
          if (!e.error) await dispatch('getOffices')
          return e
        })
        .catch(e => ({ error: e.message || e.error }))
    },
    async deleteOffice({ state, dispatch }, id) {
      return await fetch(`${API_URL}/office/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      })
        .then(e => e.json())
        .then(async (e) => ({success: e.id ? true : false}))
        .catch(e => ({ error: e.message || e.error }))
    },
    setActive({ commit }, active) {
      commit('setActive', active)
      commit('setAddState', false)
      commit('setSearch', "")
    },
    async getList({ commit,state }) {
      if(state.token){
        return await fetch(`${API_URL}/list`,{
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
          .then(e => e.json())
          .then(e => commit('setLists', e))
          .catch(e => ({ error: e.message || e.error }))
      }
    }
  }
});

export default store;