<template>
  <div class="logs-wrapper">
    <div class="actions">
      <input type="text" v-model="search" placeholder="Search" />
      <button @click="print">Print</button>
    </div>
    <div class="logs-container" id="logs">
      <table v-if="result.length > 0">
        <thead>
          <tr class="w-full">
            <th v-for="( v, k ) in th" :key="k">{{ v }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for=" item in result">
            <td v-for=" h in th" :key="h">{{ item[ h ] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
export default {
  name: 'LogsParser',
  props: {
    logs: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      result: [],
      th: [ 'employee', 'name', 'office', 'unit', 'position', 'in', 'out' ],
      search: ''
    }
  },
  methods: {
    searchHandler() {
      this.result = this.logs.filter(log => {
        for (let key in log) {
          if (log[ key ].toString().toLowerCase().indexOf(this.search.toLowerCase()) !== -1) {
            return true
          }
        }
      })
    },
    print() {
      const el = document.getElementById('logs')
      const w = window.open('', '', 'left=0,top=0,width=3508,height=3508,toolbar=0,scrollbars=0,status=0')
      const css = `
        <style>
          .logs-container {
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
            padding: 0.5rem/* 8px */;
          }

          table, th, td {
            border: .5px solid #ccc;
          }
        </style>
      `
      w.document.write(el.outerHTML + css)
      w.print()
      w.close()
    }
  },
  watch: {
    search: {
      handler: 'searchHandler',
      immediate: true
    },
    logs: {
      handler: 'searchHandler',
      immediate: true
    }
  },
}
</script>