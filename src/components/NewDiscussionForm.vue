<template>
    <div class="d-flex justify-content-center align-items-center min-vh-100 bg-white" >
        <!-- Success Message -->
        <div v-if="showSuccess" class="position-fixed end-0 m-3" style="top: 50px;">
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <strong>Discussion ajoutée avec succès !</strong>
                <button 
                    type="button" 
                    class="btn-close" 
                    @click="showSuccess = false"
                    aria-label="Close"
                ></button>
            </div>
        </div>


        <form class="w-100 p-4 border rounded border-dark" style="max-width: 70%;" @submit.prevent="handleSubmission">
            <h2 class="mb-4 text-center text-dark">Nouvelle Discussion</h2>

            <div class="mb-3">
                <label for="titre" class="form-label text-dark">Titre</label>
                <input
                    type="text"
                    class="form-control border-dark text-dark bg-white"
                    id="titre"
                    v-model="titre"
                    required
                />
            </div>

            <div class="mb-3">
                <label for="description" class="form-label text-dark">Discussion</label>
                <textarea
                    class="form-control border-dark text-dark" style="height: 20ch;"
                    id="description"
                    v-model="description"
                    required
                ></textarea>
            </div>

            <button type="submit" class="btn btn-dark w-100">Soumettre</button>
        </form>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { db } from '@/composables/useFirestore';
    import { collection, addDoc, Timestamp } from 'firebase/firestore';
    import { auth } from "@/composables/useFirestore";

    const titre = ref("");
    const description = ref("");

    const showSuccess = ref(false);

    // Check authentication state
    const getCurrentUID = () => {
        const user = auth.currentUser;
        return user ? user.uid : null;
    };

    const handleSubmission = async () => {
        try {
            let userId = getCurrentUID();
            if (userId === null) throw new Error("Failed to get user id");

            // Create a new document in the "Discussion" collection
            await addDoc(collection(db, "Discussion"), {
                titre:       titre.value,
                description: description.value,
                createdAt:   Timestamp.now(),
                createdBy:   userId
            });

            // Reset form fields
            titre.value = "";
            description.value = "";

            showSuccess.value = true;
            setTimeout(() => showSuccess.value = false, 3000);
        } catch (error) {
            console.error("Error adding discussion:", error);
        }
    };
</script>
