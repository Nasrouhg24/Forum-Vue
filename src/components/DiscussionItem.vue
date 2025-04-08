<template>
  <div class="d-flex justify-content-center align-items-center bg-light text-dark p-4" style="height: 300px;">
    <!-- Display discussion title and description -->
    <div class="text-center">
      <h5>{{ props.discussion.titre || 'Untitled Discussion' }}</h5>
      <p>{{ props.discussion.description || 'No description available' }}</p>
      <small>Created by: {{ props.UserNames[props.discussion.createdBy] || 'Unknown' }}</small>
    </div>
  </div>
</template>

<script setup>
import {defineProps} from "vue";

const props = defineProps({
  discussion: {
    type: Object,
    required: true
  },
  UserNames: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped>
</style>
