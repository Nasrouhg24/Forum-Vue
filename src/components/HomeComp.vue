

<template>
  <!-- FONCTIONNALITÉS -->
  <section class="py-5 bg-light text-center">
    <div class="container">
      <h2 class="mb-5">Ce que vous pouvez faire</h2>
      <div class="row g-4">
        <div class="col-md-6 col-lg-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="fs-2 mb-3">💬</div>
              <h5 class="card-title">Créer des discussions</h5>
              <p class="card-text">Lancez des sujets sur n'importe quel thème qui vous intéresse.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="fs-2 mb-3">🔔</div>
              <h5 class="card-title">Recevoir des notifications</h5>
              <p class="card-text">Soyez alerté en temps réel des réponses à vos discussions.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="fs-2 mb-3">👍</div>
              <h5 class="card-title">Réagir aux messages</h5>
              <p class="card-text">Exprimez votre opinion avec des réactions rapides.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="fs-2 mb-3">🔍</div>
              <h5 class="card-title">Rechercher des sujets</h5>
              <p class="card-text">Trouvez facilement les discussions qui vous intéressent.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-5">
    <div class="container">
      <h2 class="text-center mb-5">Questions fréquentes</h2>
      <div class="row g-4">
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Comment créer un compte ?</h5>
              <p class="card-text">Cliquez sur "Register", remplissez le formulaire, et validez votre inscription.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Est-ce gratuit ?</h5>
              <p class="card-text">Oui, l'inscription et l'utilisation de la plateforme sont gratuites.</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Comment démarrer une discussion ?</h5>
              <p class="card-text">Connectez-vous, puis cliquez sur "New Discussion".</p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title">Puis-je utiliser la plateforme sur mobile ?</h5>
              <p class="card-text">Oui, le site est entièrement responsive pour tous les appareils.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA FINAL -->
<section class="py-5 text-white text-center" style="background-color: #2c2c2c;" v-if="!isAuth">
  <div class="container">
    <h2 class="mb-3 text-white">Prêt à commencer ?</h2>
    <p class="text-light">Inscrivez-vous dès maintenant pour rejoindre la discussion.</p>
    <div class="mt-3 d-flex justify-content-center gap-3">
      <router-link to="/register" class="btn btn-lg btn-light">Créer un compte</router-link>
      <router-link to="/login" class="btn btn-lg btn-outline-light">Déjà membre ? Connectez-vous</router-link>
    </div>
  </div>
</section>

</template>
<script setup>
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {onMounted, ref} from "vue";

const isAuth = ref(false)
const auth = getAuth()
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isAuth.value = !!user
  })
})

</script>

