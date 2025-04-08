<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Forum</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">


        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link" exact-active-class="active">Home</router-link>
          </li>
          <li class="nav-item" v-if ="!isAuth">
            <router-link to="/register" class="nav-link" exact-active-class="active">Register</router-link>
          </li>
          <li class="nav-item" v-if ="!isAuth">
            <router-link to="/login" class="nav-link" exact-active-class="active">Login</router-link>
          </li>
          <li class="nav-item" v-if="isAuth">
            <router-link to="/profil" class="nav-link" exact-active-class="active">Profile</router-link>
          </li>
          <li class="nav-item" v-if="isAuth">
            <router-link to="/discussion" class="nav-link" exact-active-class="active">Discussions</router-link>
          </li>
          <li class="nav-item" v-if="isAuth">
            <router-link to="/create-discussion" class="nav-link" exact-active-class="active">New Discussion</router-link>
          </li>
          <li class="nav-item" v-if="isAuth">
            <button
              @click="handleSignOut"
              class="btn logout-btn"
              :disabled="loading"
            >
              <span v-if="loading">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <span>Signing out...</span>
              </span>
              <span v-else class="logout-content">
                <i class="bi bi-box-arrow-right me-2"></i>Log out
              </span>
            </button>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const isAuth = ref(false)
const auth = getAuth()
const router = useRouter()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isAuth.value = !!user
  })
})

// Sign out function
const handleSignOut = () => {
  signOut(auth).then(() => {
    router.push('/')
  })
}






</script>

<style scoped>

</style>
