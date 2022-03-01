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
            <th @click="toggleSort(0)">Date <span v-if="sortFieldsBy === 0"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(1)">Name <span v-if="sortFieldsBy === 1"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(2)">Office  <span v-if="sortFieldsBy === 2"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(3)">Unit  <span v-if="sortFieldsBy === 3"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(4)">Position  <span v-if="sortFieldsBy === 4"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(5)" colspan="2">AM  <span v-if="sortFieldsBy === 5"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
            <th @click="toggleSort(7)" colspan="2">PM  <span v-if="sortFieldsBy === 7"> <i v-if="sortFieldsAsc">▲</i> <i v-if="!sortFieldsAsc">▼</i> </span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(  i, ik  ) in result" :key="ik">
            <td v-for="(  f, fk  ) in i" :key="fk">{{ f }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import { format } from 'date-fns'
export default {
  name: 'LogsParser',
  props: {
    logs: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      result: [],
      search: '',
      lastFieldBy: 5,
      sortFieldsBy: 5,
      sortFieldsAsc: false,
    }
  },
  methods: {
    toggleSort(field){
      this.lastFieldBy = this.sortFieldsBy
      this.sortFieldsBy = field

      if (this.lastFieldBy === field) {
        this.sortFieldsAsc = !this.sortFieldsAsc
      }

      this.sortBy(this.sortFieldsBy, this.sortFieldsAsc)
    },
    transform(logs) {
      return logs.map(log => [
        log[0],
        log[1],
        log[2],
        log[3],
        log[4],
        log[5] ? format(new Date(log[5]), 'hh:mm') : '-',
        log[6] ? format(new Date(log[6]), 'hh:mm') : '-',
        log[7] ? format(new Date(log[7]), 'hh:mm') : '-',
        log[8] ? format(new Date(log[8]), 'hh:mm') : '-',
      ])
    },
    searchHandler() {
      if (this.search.length > 0) {
        this.result = []
        this.logs.forEach(item => {
          for (let i in item) {
            const search = this.search.toLowerCase()
            const field = item[ i ]
            if (String(field).toLowerCase().indexOf(search) > -1) {
              this.result.push(item)
              break;
            }
          }
        })
      } else {
        this.result = this.logs
      }
      this.sortBy(this.sortFieldsBy, this.sortFieldsAsc)
      this.result = this.transform(this.result)
    },
    sortBy(field, asc = true) {
      this.result.sort((a, b) => {
        if (a[ field ] > b[ field ]) {
          return asc ? 1 : -1
        } else if (a[ field ] < b[ field ]) {
          return asc ? -1 : 1
        } else {
          return 0
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
            padding: 0 0.25rem;
            text-align: center;
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
<style lang="scss" scoped>
.logs-wrapper {
  @apply w-full;
  .actions {
    @apply flex flex-row justify-between items-center py-4;
    input {
      @apply mr-2 py-1 text-sm px-3 border outline-none rounded w-full border-gray-400 flex-1;
    }
    button {
      @apply px-4 py-1 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded transition duration-300 ease-in-out;
    }
  }
  .logs-container {
    @apply w-full;

    table {
      @apply w-full text-sm;
      border-collapse: collapse;

      tr {
        th {
          @apply capitalize cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition duration-300 ease-in-out;
        }

        td,
        th {
          @apply px-1 py-0 text-center;
        }
      }
    }

    table,
    th,
    td {
      border: 0.5px solid #ccc;
    }
  }
}
</style>