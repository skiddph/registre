import { createApp } from 'vue'
import { createStore } from 'vuex';
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import App from './App.vue'
import '@/styles/global.scss'

const API_URL = import.meta.env.VITE_API_URL || "/api"

// Vue Router
const routes = setupLayouts(generatedRoutes)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Vuex
const store = createStore({
  state: {
    app: {
      name: "Registre"
    },
    token: '',
    role: '',
    name: '',
    user: '',
    usercount: 0,
    admincount: 0,
    superadmincount: 0,
    offices: [],
    positions: [],
    employees: [],
    units: [],
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
    }
  }
});


// Vue
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')