<template>
  <div>
    <h1 class="text-center my-4">Welcome to the Forum</h1>
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getDiscussions, getUserById } from "@/data/getData";

const discussions = ref([]);
const UserNames = ref({});

onMounted(async () => {
  try {
    console.log("Fetching discussions...");
    const fetchedDiscussions = await getDiscussions();
    discussions.value = fetchedDiscussions;

    // Pour chaque discussion, récupère le nom de l'utilisateur
    for (const discussion of fetchedDiscussions) {
      const user = await getUserById(discussion.createdBy);
      if (user) {
        UserNames.value[discussion.createdBy] = user.username || `User ${discussion.createdBy}`;
      } else {
        UserNames.value[discussion.createdBy] = 'Unknown';
      }
    }

    console.log("Discussions and users fetched successfully.");



  } catch (error) {
    console.error("Error fetching discussions:", error);
  }
});
</script>

<style scoped>
.carousel-container {
  max-width: 900px;  /* Increased from 800px */
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
  bottom: -30px;
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