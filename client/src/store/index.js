import { createStore } from 'vuex';
import { createMutations, createResetAction } from './lib'
import system from './system'
import user from './user'
import dashboard from './dashboard'
import employee from './employee'
import logs from './logs'
const SERVER_URL = import.meta.env.VITE_API_URL || ""
const API_URL = SERVER_URL + "/api/v2"

const DEFAULT_ROOT_STATE = {
  server_url: SERVER_URL,
  api_url: API_URL,
  app: {
    name: "Registre"
  },
  darkMode: false,
  darkModeInit: false
}

const store = createStore({
  modules: {
    system,
    user,
    dashboard,
    employee,
    logs
  },
  state: Object.assign({}, DEFAULT_ROOT_STATE),
  mutations: createMutations(DEFAULT_ROOT_STATE),
  actions: {
    reset: createResetAction(DEFAULT_ROOT_STATE),
    printTable({ rootState }) {
      const el = document.getElementById('for-print')
      const w = window.open('', '', 'left=0,top=0,toolbar=0,scrollbars=0,status=0')
      const css = `
        <style>
          #for-print {
            font-family: Avenir, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-align: left;
            color: #2c3e50;
            width: 100%;
            margin: 0;
            padding: 0;
            border: 0;
            box-sizing: border-box;
          }

          table {
            width: 100%;
            font-size: 0.875rem/* 14px */;
            line-height: 1.25rem/* 20px */;
            border-collapse: collapse;
          }

          thead {
            text-align: left;
          }

          th {
            text-transform: capitalize;
          }

          td, th {
            padding: 0 0.25rem;
            text-align: center;
          }

          .grace-period {
            color: yellow;
          }

          .late {
            color: tomato;
          }

          table, th, td {
            border: .5px solid #ccc;
          }

          tr.grace td {
            color: yellow;
          }

          tr.late td {
            color: red;
          }
        </style>
      `
      w.document.write(el.outerHTML + css)
      w.document.title = String(rootState.dashboard.active)
      w.print()
      w.close()
    },
    darkModeInit({ commit, state }) {
      if (state.darkModeInit) return
      const darkMode = localStorage.getItem('darkMode') == 'true'
      if (darkMode) {
        document.body.classList.add('dark')
      } else {
        document.body.classList.remove('dark')
      }
      commit('darkMode', darkMode)
      localStorage.setItem('darkMode', darkMode)
      commit('darkModeInit', true)
    },
    toggleDarkMode({ commit, state, dispatch }) {
      if (!state.darkModeInit) dispatch('darkModeInit');
      commit('darkMode', !state.darkMode)
      localStorage.setItem('darkMode', state.darkMode)
      if (state.darkMode) {
        document.body.classList.add('dark')
      } else {
        document.body.classList.remove('dark')
      }
    },
    async backupData({ rootState }, fields) {
      const url = await fetch(`${rootState.api_url}/data/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.user.token}`
        },
        body: JSON.stringify({ backup: fields })
      })
      .then(res => res.json())

      if(url.status == "success") {
        const downloadLink = rootState.server_url + url.link

        // fetch raw json file content
        const response = await fetch(downloadLink)
        const blob = await response.blob()
        
        // create a link to the file
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = url.filename
        console.log(url)
        a.click()
        return true
      } else {
        alert(url.message || "Failed to backup data")
        return false
      }
    },
    async resetData({ rootState }) {
      return await fetch(`${rootState.api_url}/data/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rootState.user.token}`
        },
        // empty body
        body: JSON.stringify({})
      })
      .then(res => res.json())
      .then(e => e.status == "success")
    }
  }
})

export default store;