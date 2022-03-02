<script setup>
import { watchEffect, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import LogsParser from '@/components/LogsParser.vue'

const store = useStore()
const router = useRouter()

watchEffect(async () => {
  await store.dispatch('getLogs')
})

const more = ref(false)

const years = (() => {
  const now = new Date()
  const years = []
  for (let i = now.getFullYear(); i >= 2022; i--) {
    years.push(i)
  }
  return years
})()

const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

const hours = (() => {
  const hours = []
  for (let i = 0; i < 24; i++) {
    hours.push(i)
  }
  return hours
})()

const minutes = (() => {
  const minutes = []
  for (let i = 0; i < 60; i++) {
    minutes.push(i)
  }
  return minutes
})()

</script>
<template>
  <div class="logs-filter">
    <div class="less">
      <label>
        <input type="checkbox" v-model="more" />
        Show filters
      </label>
    </div>
    <div v-if="more" class="more">
      <div class="from">
        <label>From</label>
        <div>
          <label>Year</label>
          <select v-model="store.state.logsFilter.from.year">
            <option v-for=" year in years" :value="year">{{ year }}</option>
          </select>
        </div>
        <div>
          <label>Month</label>
          <select v-model="store.state.logsFilter.from.month">
            <option v-for="(month, i) in months" :value="i">{{ month }}</option>
          </select>
        </div>
        <div>
          <label>Day</label>
          <select v-model="store.state.logsFilter.from.day">
            <option v-for="  day   in 31" :value="day">{{ day }}</option>
          </select>
        </div>
        <div>
          <label>Hour</label>
          <select v-model="store.state.logsFilter.from.hour">
            <option v-for="hour in hours" :value="hour">{{ hour }}</option>
          </select>
        </div>
        <div>
          <label>Minute</label>
          <select v-model="store.state.logsFilter.from.minute">
            <option v-for="minute in minutes" :value="minute">{{ minute }}</option>
          </select>
        </div>
      </div>
      <div class="to">
        <label>To</label>
        <div>
          <label>Year</label>
          <select v-model="store.state.logsFilter.to.year">
            <option v-for=" year in years" :value="year">{{ year }}</option>
          </select>
        </div>
        <div>
          <label>Month</label>
          <select v-model="store.state.logsFilter.to.month">
            <option v-for="(month, i) in months" :value="i">{{ month }}</option>
          </select>
        </div>  
        <div>
          <label>Day</label>
          <select v-model="store.state.logsFilter.to.day">
            <option v-for="  day   in 31" :value="day">{{ day }}</option>
          </select>
        </div>  
        <div>
          <label>Hour</label>
          <select v-model="store.state.logsFilter.to.hour">
            <option v-for="hour in hours" :value="hour">{{ hour }}</option>
          </select>
        </div>
        <div>
          <label>Minute</label>
          <select v-model="store.state.logsFilter.to.minute">
            <option v-for="minute in minutes" :value="minute">{{ minute }}</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button @click="store.dispatch('getLogs')">Submit</button>
      </div>
    </div>
  </div>
  <LogsParser :logs="store.state.logs" />
</template>
<style lang="scss">
.logs-filter {
  @apply w-full flex flex-col items-start justify-center;

  .less {
    @apply w-full flex flex-col items-start justify-center;

    .basic-filter {
      @apply flex;

      h3 {
        @apply text-base font-bold mr-2;
      }

      select {
        @apply border border-gray-400;
      }
    }

    label {
      @apply block mt-4;

      input {
        @apply mr-1;
      }
    }
  }
  .more {
    @apply flex flex-col items-start justify-center mt-4;

    .from,
    .to {
      @apply flex flex-row items-start justify-center mb-4;

      & > label {
        @apply text-sm font-bold;
        min-width: 70px;
      }

      div {
        @apply flex flex-col mr-2;

        label {
          @apply mr-2 text-sm;
        }

        select {
          @apply border border-gray-400 text-sm;
        }
      }
    }

    .actions {
      @apply w-full flex flex-row items-center justify-end my-4;

      button {
        @apply px-4 py-1 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded-full transition duration-300 ease-in-out;
      }
    }
  }
}
</style>