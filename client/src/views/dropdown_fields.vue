<template>
  <div class="wrapper">
    <div class="container">
      <div class="title">Dropdown Fields</div>
      <div class="fields">
        <div class="field">Hello</div>
        <div class="field">Hello</div>
        <div class="field">Hello</div>
        <div class="field">Hello</div>
      </div>
      <div class="action">
        <input type="text" />
        <button>
          <icon icon="plus" />
        </button>
      </div>
    </div>
  </div>
</template>
<style lang='scss' scoped>
.wrapper {
  @apply w-full flex flex-col items-center justify-center my-4;

  .container {
    @apply w-full p-2 border;
    max-width: 500px;

    .title {
      @apply text-lg mb-2;
    }

    .fields {
      @apply w-full flex flex-col justify-center items-start;

      .field {
        @apply w-full mt-2 border-b;
      }
    }
  }
}
</style>