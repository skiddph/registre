<template>
  <div :class="`indicator ${state}`" />
</template>
<script>
export default {
  props: {
    state: {
      type: String,
      default: 'loading',
    },
  },
}
</script>