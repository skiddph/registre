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
  }
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
    printTable({rootState}){
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
        </style>
      `
      w.document.write(el.outerHTML + css)
      w.document.title = String(rootState.dashboard.active)
      w.print()
      w.close()
    }
  }
})

export default store;