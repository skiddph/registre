<script setup>
import { ref, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const name = ref('')
const user = ref('')
const pass = ref('')
const cpass = ref('')
const error = ref('')

const register = async () => {
  if (user.value.trim() === '' || pass.value.trim() === '' || cpass.value.trim() === '' || name.value.trim() === '') {
    error.value = 'All fields are required and cannot be empty'
    return
  }
  if (pass.value !== cpass.value) {
    error.value = 'Passwords do not match'
    return
  }

  const lr = await store.dispatch('register', { user: user.value, pass: pass.value, name: name.value })
  error.value = lr.error || ""
}

watchEffect(() => {
  if (store.state.token) {
    router.push('/')
  }
})
document.title = "Sign Up | Registre"

</script>
<template>
  <div class="auth-form-container">
    <div class="auth-form">
      <h1>Register</h1>
      <span v-if="error" @click="error = ''" class="error message">{{ error }}</span>
      <label for="name">
        <icon icon="user" />Name
      </label>
      <input type="text" name="name" v-model="name" />
      <label for="user">
        <icon icon="at" />Username
      </label>
      <input type="text" name="user" v-model="user" />
      <label for="pass">
        <icon icon="key" />Password
      </label>
      <input type="password" name="pass" v-model="pass" />
      <label for="cpass">
        <icon icon="key" />Confirm password
      </label>
      <input type="password" name="cpass" v-model="cpass" />
      <button @click="register">Register</button>
    </div>
  </div>
</template>