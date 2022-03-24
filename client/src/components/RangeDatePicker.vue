<script setup>
import { ref, onMounted } from 'vue'
import { format } from 'date-fns'

const from = ref(0)
const to = ref(0)
const advance = ref(false)
const mydate = ref(null)
const fromdate = ref(null)
const todate = ref(null)
const fromtime = ref(null)
const totime = ref(null)

const dateHandler = () => {
  if (mydate.value && !mydate.value?.value) mydate.value.value = format(new Date(), 'yyyy-MM-dd')
  if (fromdate.value && !fromdate.value?.value) fromdate.value.value = format(new Date(), 'yyyy-MM-dd')
  if (todate.value && !todate.value?.value) todate.value.value = format(new Date(), 'yyyy-MM-dd')
  if (fromtime.value && !fromtime.value?.value) fromtime.value.value = format(new Date().setHours(0, 0, 0, 0), 'HH:mm')
  if (totime.value && !totime.value?.value) totime.value.value = format(new Date().setHours(23, 59, 59, 999), 'HH:mm')

  if (!advance.value) {
    from.value = new Date(mydate.value?.value + ' 00:00:00').getTime()
    to.value = new Date(mydate.value?.value + ' 23:59:59').getTime()
  } else {
    from.value = new Date(fromdate.value?.value + ' ' + fromtime.value?.value).getTime()
    to.value = new Date(todate.value?.value + ' ' + totime.value?.value).getTime()
  }
}

onMounted(() => dateHandler())
const emits = defineEmits([ 'cancel', 'submit' ])
</script>
<template>
  <div class="wrapper">
    <div class="bg" @click="emits('cancel')"></div>
    <div class="container">
      <h3 class="title">
        Select date
        <span v-if="advance">range</span>
      </h3>
      <div class="group">
        <input type="checkbox" v-model="advance" id="advance" />
        <label for="advance">Advanced</label>
      </div>
      <div class="date-container" v-show="advance">
        <div class="from">
          <h3>From</h3>
          <div class="group">
            <label for="date-from">Date</label>
            <input type="date" id="date-from" @change="dateHandler" ref="fromdate" />
          </div>
          <div class="group">
            <label for="date-from">Time</label>
            <input type="time" id="tme-from" @change="dateHandler" ref="fromtime" />
          </div>
        </div>
        <div class="to">
          <h3>To</h3>
          <div class="group">
            <label for="date-to">Date</label>
            <input type="date" id="date-to" @change="dateHandler" ref="todate" />
          </div>
          <div class="group">
            <label for="date-to">Time</label>
            <input type="time" id="tme-to" @change="dateHandler" ref="totime" />
          </div>
        </div>
      </div>
      <div class="date-container" v-show="!advance">
        <div class="date-only">
          <h3>Select Date</h3>
          <div class="group">
            <label for="date-to">Date</label>
            <input type="date" id="date-to" @change="dateHandler" ref="mydate" />
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="emits('cancel')">Cancel</button>
        <button @click="emits('submit', { from, to })">Okay</button>
      </div>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.wrapper {
  @apply w-screen h-screen flex flex-row items-center justify-center fixed;
  z-index: 100;
  .bg {
    @apply w-screen h-screen fixed top-0 left-0;
    z-index: 101;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .container {
    @apply bg-white w-full rounded overflow-auto py-2 px-4 fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 102;
    max-width: 500px;
    animation: fadeIn 0.3s ease-in-out;

    @keyframes fadeIn {
      from {
        transform: translate(-50%, 50%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%);
        opacity: 1;
      }
    }

    .title {
      @apply text-lg text-gray-700 mb-2;
    }

    input[type="checkbox"],
    label[for="advance"] {
      @apply cursor-pointer mr-2 text-base;
      user-select: none;
    }

    .date-container {
      @apply w-full flex flex-row items-start justify-center;

      & > .group {
        @apply flex flex-row items-center justify-center;
      }

      .from,
      .to {
        @apply w-full px-1 mt-6;
        .group {
          @apply w-full flex flex-row items-center justify-between border border-gray-300 rounded mb-2 py-1 px-2 text-sm focus:border-gray-500;

          * {
            outline: none;
            user-select: none;
            cursor: pointer;
          }
          label {
            @apply text-sm text-gray-700;
          }
          input {
            @apply pl-2;
          }
        }
      }

      .date-only {
        @apply w-full flex flex-row items-center justify-center mt-6 mb-4;

        h3 {
          @apply mr-2;
          word-wrap: normal;
        }

        .group {
          @apply flex-1 flex flex-row items-center justify-between border border-gray-300 rounded py-1 px-2 text-sm focus:border-gray-500;
          * {
            outline: none;
            user-select: none;
            cursor: pointer;
          }
          label {
            @apply mr-2;
          }
          input {
            @apply flex-1;
          }
        }
      }
    }

    .actions {
      @apply my-2 w-full flex flex-row items-end justify-end;
      button {
        @apply bg-blue-500 hover:bg-blue-700 text-blue-100 rounded text-sm py-1 px-4 ml-2 transition duration-200 ease-in-out transform;
      }
    }
  }
}
</style>
