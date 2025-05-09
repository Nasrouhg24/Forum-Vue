<template>

  <!--Bootstrap icon -->
  <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
    <symbol id="exclamation-triangle-fill" viewBox="0 0 16 16">
      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
    </symbol>
  </svg>

  <div
    class="alert alert-danger alert-dismissible fade show d-flex align-items-center shadow-sm border border-danger-subtle"
    role="alert"
    v-if="errNetwork"
  >
        <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
          <use xlink:href="#exclamation-triangle-fill"/>
        </svg>
        <div class="flex-grow-1">
          <strong>Problème de connexion réseau :</strong> Veuillez vérifier votre connexion Internet.
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" @click="errNetwork = false"></button>
  </div>

  <div class="d-flex justify-content-center align-items-center min-vh-100 bg-white" >
    <form class="w-100 p-4 border rounded border-dark" style="max-width: 400px;" @submit.prevent="handleLogin">
      <h2 class="mb-4 text-center text-dark">Se connecter</h2>

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
        <small v-if="err" class="invalid-feedback d-block text-danger">Problème d'authentification veuillez verifier votre email ou mot de passe </small>
      </div>

      <button
        type="submit"
        class="btn btn-dark w-100"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Se connecter
      </button>

      <!-- Google Authentication Button -->
      <hr class="my-4" />
      <button
        type="button"
        class="btn btn-outline-dark w-100"
        @click="handleGoogleSignIn"
        :disabled="isLoadingGoogle"
      >
        <span v-if="isLoadingGoogle" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Continuer avec Google
      </button>

      <div class="d-flex justify-content-center mt-2">
        <router-link to="/register" class="text-dark" style="font-size: 0.9rem;">Créer un compte</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser, signInWithGoogle } from '@/composables/useAuth';

const email = ref("");
const password = ref("");
const router = useRouter();
const err = ref(false);
const errNetwork = ref(false);
const isLoading = ref(false);
const isLoadingGoogle = ref(false);

const handleLogin = async () => {
  err.value = false;
  errNetwork.value = false;
  isLoading.value = true;

  try {
    const {user, error} = await loginUser({ email: email.value, password: password.value });
    if (user) {
      router.push("/");
    }
    if (error) {
      if (error.code === "auth/network-request-failed") {
        console.log("No connection");
        errNetwork.value = true;
      } else {
        err.value = true;
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    err.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleGoogleSignIn = async () => {
  err.value = false;
  errNetwork.value = false;
  isLoadingGoogle.value = true;

  try {
    const { user, error: googleError } = await signInWithGoogle();

    if (googleError) {
      if (googleError.code === "auth/network-request-failed") {
        errNetwork.value = true;
      } else {
        err.value = true;
      }
      console.error("Google sign-in error:", googleError);
      return;
    }

    if (user) {
      router.push("/");
    }
  } catch (error) {
    console.error("Google sign-in unexpected error:", error);
    err.value = true;
  } finally {
    isLoadingGoogle.value = false;
  }
};
</script>

<style scoped>
.alert {
  transition: opacity 0.5s ease-in-out, transform 0.3s ease-in-out;
}
</style>