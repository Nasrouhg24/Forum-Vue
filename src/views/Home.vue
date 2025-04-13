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

  <div>
    <h1 v-if="isAuth" class="text-center my-4">Welcome {{currentUsername}} , to the Forum</h1>
    <h1 v-if="!isAuth" class="text-center my-4">Welcome to the Forum</h1>
    <h2 class="text-center mb-4">Latest Discussions</h2>

    <!-- Show the carousel only if discussions exist -->
    <div v-if="discussions.length > 0" class="carousel-container">
      <div id="discussionCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-touch="true" data-bs-interval="5000">
        <!-- Carousel indicators -->
        <div class="carousel-indicators">
          <button v-for="(_, index) in discussions.slice(0, 3)"
                  :key="'indicator-'+index"
                  type="button"
                  :data-bs-target="'#discussionCarousel'"
                  :data-bs-slide-to="index"
                  :class="{ active: index === 0 }"
                  :aria-current="index === 0 ? 'true' : 'false'"
                  :aria-label="'Slide ' + (index + 1)"></button>
        </div>

        <div class="carousel-inner">
          <!-- Loop through the first three discussions -->
          <div v-for="(discussion, index) in discussions.slice(0, 3)"
               :key="discussion.id"
               :class="{ 'carousel-item': true, 'active': index === 0 }">

            <div class="discussion-card">
              <div class="card-body text-center">
                <h5 class="card-title">{{ discussion.titre || 'Untitled Discussion' }}</h5>
                <p class="card-text">{{ discussion.description || 'No description available' }}</p>
                <div class="card-footer d-flex justify-content-between align-items-center">
                  <small class="text-muted">Created by: {{ UserNames[discussion.createdBy] || 'Unknown' }}</small>
                  <small class="swipe-hint text-muted fst-italic">Swipe for more</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Carousel controls -->
        <button class="carousel-control-prev" type="button" data-bs-target="#discussionCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#discussionCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- Show message if no discussions found -->
    <p v-else class="text-center text-muted">No discussions available.</p>
  </div>

  <HomeComp ></HomeComp>
</template>

<script setup>
import HomeComp from "@/components/HomeComp.vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { getDiscussions, getUserById } from "@/data/getData";
import {  onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from "@/composables/useFirestore"; // Corrected to use imported auth

const discussions = ref([]);
const UserNames = ref({});
const errNetwork = ref(!navigator.onLine); // set to true if offline at load
const loading = ref(true);
const isAuth = ref(false);
const currentUsername = ref('');

// Check for network connection
const checkConnection = () => {
  errNetwork.value = !navigator.onLine;
};

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isAuth.value = !!user;

    if (user) {
      try {
        const userDocRef = doc(db, 'Utilisateurs', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          currentUsername.value = userSnap.data().username;
        } else {
          console.warn('No user document found in Firestore.');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du username:', err);
      }
    }
  });
});

onMounted(async () => {
  window.addEventListener("online", checkConnection);
  window.addEventListener("offline", checkConnection);

  checkConnection(); // initial check

  if (errNetwork.value) {
    loading.value = false;
    return;
  }

  try {
    const {fetchedDiscussions, error} = await getDiscussions();

    if (error) {
      if (error.code === "auth/network-request-failed") {
        errNetwork.value = true;
        return;
      }
    }

    discussions.value = fetchedDiscussions || [];

    for (const discussion of fetchedDiscussions) {
      const user = await getUserById(discussion.createdBy);
      UserNames.value[discussion.createdBy] = user?.username || "Unknown";
    }

  } catch (error) {
    console.error("Error fetching discussions:", error);
    errNetwork.value = true;
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("online", checkConnection);
  window.removeEventListener("offline", checkConnection);
});
</script>

<style scoped>
.carousel-container {
  max-width: 900px; /* Increased from 800px */
  margin: 0 auto;
  position: relative;
}

.discussion-card {
  height: 300px;
  margin: 10px 20px;
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  transition: transform 0.3s, box-shadow 0.3s;
  width: calc(100% - 40px);
}

.discussion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.card-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.card-text {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-top: auto;
}

.swipe-hint {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Style the carousel control buttons */
.carousel-control-prev,
.carousel-control-next {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;
}

.carousel-control-prev {
  left: 10px;
}

.carousel-control-next {
  right: 10px;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1) grayscale(100);
}

/* Style the indicators */
.carousel-indicators {
  bottom: -50px;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  margin: 0 5px;
}

.carousel-indicators button.active {
  background-color: #666;
}
</style>
