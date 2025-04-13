<template>
    <div>
        test {{props.id}}
    </div>
</template>

<script setup>
    import { defineProps } from 'vue';
    const props = defineProps({ id: String });
</script>
