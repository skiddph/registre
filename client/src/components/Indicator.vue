<template>
  <div :class="`indicator ${state}${large ? ' large' : ''}`" />
</template>
<script>
export default {
  props: {
    state: {
      type: String,
      default: 'loading',
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
<style lang="scss" scoped>
.indicator {
  @apply p-1 rounded-full my-2 mx-4 border inline-block;
  border-color: rgba(255,255,255,0);

  &.large {
    @apply p-2;
  }

  &.ready {
    background-color: #00ff00;
  }

  &.error {
    background-color: #ff0000;
  }

  &.in {
    background-color: #0080ff;
  }

  &.out {
    background-color: #1b1b1b;
    border-color: rgba(255,255,255,1);
  }

  &.loading {
    background-color: #dd8533;
  }
}
</style>