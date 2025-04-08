<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-white">
    <form class="w-100 p-4 border rounded border-dark" style="max-width: 400px;" @submit.prevent="handleSubmit">
      <h2 class="mb-4 text-center text-dark">Créer un compte</h2>

      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <div class="mb-3">
        <label for="username" class="form-label text-dark">Nom d'utilisateur</label>
        <div class="input-group">
          <span class="input-group-text bg-white text-dark border-dark">@</span>
          <input
            type="text"
            class="form-control border-dark text-dark bg-white"
            id="username"
            v-model="username"
            required
          />
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label text-dark">Adresse e-mail</label>
        <input
          type="email"
          class="form-control border-dark text-dark bg-white"
          id="email"
          v-model="email"
          required
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label text-dark">Mot de passe</label>
        <input
          type="password"
          class="form-control border-dark text-dark bg-white"
          id="password"
          v-model="password"
          required
        />
        <small class="text-muted">Le mot de passe doit contenir au moins 6 caractères</small>
      </div>

      <div class="mb-4">
        <label for="confirmPassword" class="form-label text-dark">Confirmer le mot de passe</label>
        <input
          type="password"
          class="form-control border-dark text-dark bg-white"
          id="confirmPassword"
          v-model="confirmPassword"
          required
        />
      </div>

      <button
        type="submit"
        class="btn btn-dark w-100"
        :disabled="isInvalid || isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        S'inscrire
      </button>

      <div class="d-flex justify-content-end mt-2">
        <router-link to="/login" class="text-dark" style="font-size: 0.9rem;">Login</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue'
import {registerUser} from "@/composables/useAuth";
import {useRouter} from 'vue-router';

const router = useRouter();
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)

// Validation des champs du formulaire
const isInvalid = computed(() => {
  return (
      !username.value ||
      !email.value ||
      !password.value ||
      !confirmPassword.value ||
      password.value !== confirmPassword.value ||
      password.value.length < 6
  );
});

async function handleSubmit() {
  error.value = '';
  isLoading.value = true;

  try {


    await registerUser({
      email: email.value,
      password: password.value,
      username: username.value
    });


    router.push('/login?registered=true');
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>

.alert {
  margin-bottom: 15px;
  border-radius: 4px;
}
</style>