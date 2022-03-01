<template>
  <div v-if="false" class="legends">
    <h3>Legends</h3>
    <div>
      <Indicator state="ready" />- Ready
    </div>
    <div>
      <Indicator state="loading" />- Detected
    </div>
    <div>
      <Indicator state="in" />- Employee In
    </div>
    <div>
      <Indicator state="out" />- Employee Out
    </div>
    <div>
      <Indicator state="error" />- Error
    </div>
  </div>
</template>