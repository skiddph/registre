<script setup>
import { ref, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const user = ref('')
const pass = ref('')
const error = ref('')

const login = async () => {
	if (user.value.trim() === '' || pass.value.trim() === '') {
		error.value = 'Username or password cannot be empty'
		return
	}
	error.value = ''
	const submit = await store.dispatch('user/login', { user: user.value, pass: pass.value })
	error.value = submit.status == 'error' ? submit.message || "Unkown error occur" : ""
}

watchEffect(() => {
	if (store.state.user.token) {
		router.push('/')
	}
})
document.title = "Sign In | Registre"
</script>
<template>
	<div class="auth-form-container">
		<div class="auth-form">
			<h1>Login</h1>
			<span v-if="error" @click="error = ''" class="error message">{{ error }}</span>
			<label for="user">
				<icon icon="user" />Username
			</label>
			<input type="text" name="user" v-model="user" placeholder="Username" />
			<label for="pass">
				<icon icon="key" />Password
			</label>
			<input type="password" name="pass" v-model="pass" placeholder="Password" />
			<button @click="login">Login</button>
		</div>
	</div>
</template>