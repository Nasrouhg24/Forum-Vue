
<template>
<div>
    <h1 class="text-center my-4">Welcome to the Forum</h1>
    <h2 class="text-center mb-4">Latest Discussions</h2>

    <!-- Show the carousel only if discussions exist -->
    <div v-if="discussions.length > 0" id="discussionCarousel" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-inner">
        <!-- Loop through the first three discussions -->
        <div v-for="(discussion, index) in discussions.slice(0, 3)"
             :key="discussion.id"
             :class="['carousel-item', index === 0 ? 'active' : '']">
              <DiscussionItem discussion="discussion"  UserNames ="UserNames" ,></DiscussionItem>
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

    <!-- Show message if no discussions found -->
    <p v-else class="text-center text-muted">No discussions available.</p>
  </div>
</template>
<script setup>

import { ref, onMounted } from "vue";
import { getDiscussions, getUserById } from "@/data/getData";
import DiscussionItem from "@/components/DiscussionItem.vue";

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

</style>