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
      edit: false,
      id: 0,
      search: ""
    },
    logs: [],
    logsFilter: {
      from: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate(),
        hour: 0,
        minute: 0,
        second: 0,
        ms: 0
      },
      to: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        day: new Date().getDate(),
        hour: 23,
        minute: 59,
        second: 59,
        ms: 999
      },
      id: "",
      position: "",
      unit: "",
      office: "",
      name: ""
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
    setEditState(state, edit) {
      try {
        state.dash.edit = edit.state
        state.dash.id = edit.id
      } catch (e) {

      }
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
    },
    setLogs(state, logs) {
      state.logs = logs
    },
    setLogsFilter(state, filter) {
      state.logsFilter = filter
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
      return await fetch(`${API_URL}/user`, {
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
        .then(async (e) => ({ success: e.id ? true : false }))
        .catch(e => ({ error: e.message || e.error }))
    },
    setActive({ commit }, active) {
      commit('setActive', active)
      commit('setAddState', false)
      commit('setSearch', "")
    },
    async getList({ commit, state }) {
      if (state.token) {
        return await fetch(`${API_URL}/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
          .then(e => e.json())
          .then(e => commit('setLists', e))
          .catch(e => ({ error: e.message || e.error }))
      }
    },
    async delete({state}, { tab, id }) {
      if (state.token) {
        let action = ''
        switch (tab) {
          case 0:
            action = 'employee'
            break;
          case 1:
            action = 'office'
            break;
          case 2:
            action = 'unit'
            break;
          case 3:
            action = 'position'
            break;
          case 4:
            action = 'user'
            break;
        }
        return await fetch(`${API_URL}/${action}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        })
          .then(e => e.json())
          .then(async (e) => {
            await store.dispatch('getList')
            return { success: e.id ? true : false , ...e}
          })
          .catch(e => ({ error: e.message || e.error }))
      } else {
        return {error: "No token"}
      }
    },
    async update({ state }, { tab, id, data }) {
      for (let key in data) {
        if (data[key] === '') {
          return { error: `${key} can't be empty` }
        }
      }
      if (state.token) {
        let action = ''
        switch (tab) {
          case 0:
            action = 'employee'
            break;
          case 1:
            action = 'office'
            break;
          case 2:
            action = 'unit'
            break;
          case 3:
            action = 'position'
            break;
          case 4:
            action = 'user'
            break;
        }
        return await fetch(`${API_URL}/${action}/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })
          .then(e => e.json())
          .then(async (e) => {
            await store.dispatch('getList')
            return { success: e.id ? true : false, ...e }
          })
          .catch(e => ({ error: e.message || e.error }))
      } else {
        return {error: "No token"}
      }
    },
    async create({ state }, { tab, data }) {
      for (let key in data) {
        if (data[key] === '') {
          return { error: `${key} is required` }
        }
      }

      if (state.token) {
        let action = ''
        switch (tab) {
          case 0:
            action = 'employee'
            break;
          case 1:
            action = 'office'
            break;
          case 2:
            action = 'unit'
            break;
          case 3:
            action = 'position'
            break;
          case 4:
            action = 'user'
            break;
        }
        return await fetch(`${API_URL}/${action}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })
          .then(e => e.json())
          .then(async (e) => {
            await store.dispatch('getList')
            return { success: e.id ? true : false, ...e }
          })
          .catch(e => ({ error: e.message || e.error }))
      } else {
        return {error: "No token"}
      }
    },
    async log(ctx, id) {
      return await fetch(`${API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ id })
      })
        .then(e => e.json())
        .then(e => e)
        .catch(e => ({ error: e.message || e.error }))
    },
    async getLogs({ commit, state ,dispatch }) {
      return await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(state.logsFilter)
      })
        .then(e => e.json())
        .then(e => {
          if(Array.isArray(e)) dispatch('sortLogs', e)
          return e
        })
        .catch(e => ({ error: e.message || e.error }))
    },
    sortLogs({commit}, logs) {
      logs.sort((a, b) => {
        if (a.in < b.in) return 1
        if (a.in > b.in) return -1
        return 0
      })
      for (let i = 0; i < logs.length; i++) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        let p_in = new Date(logs[i].in)
        let p_out = new Date(logs[i].out)
        // format datetime to string - Jan 1, 2019 12:00 AM
        logs[i].in = `${months[p_in.getMonth()]} ${p_in.getDate()}, ${p_in.getFullYear()} ${p_in.getHours() > 12 ? p_in.getHours() - 12 : p_in.getHours()}:${p_in.getMinutes()} ${p_in.getHours() >= 12 ? 'PM' : 'AM'}`
        logs[i].out = logs[i].isOut ? `${months[p_out.getMonth()]} ${p_out.getDate()}, ${p_out.getFullYear()} ${p_out.getHours() > 12 ? p_out.getHours() - 12 : p_out.getHours()}:${p_out.getMinutes()} ${p_out.getHours() >= 12 ? 'PM' : 'AM'}` : '-'
        delete logs[i].isOut
        delete logs[i].id
      }
     commit('setLogs', logs)
    }
  }
})

export default store;