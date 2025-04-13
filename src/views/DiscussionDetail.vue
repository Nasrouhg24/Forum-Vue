<template>
    <div class="container py-5">
        <!-- Loading Spinner -->
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-3">Chargement de la discussion...</p>
        </div>

        <!-- Discussion Details -->
        <div v-else>
            <div class="mb-4">
                <h1 class="fw-bold text-primary">{{ discussion.titre }}</h1>
                <div class="d-flex align-items-center mb-2 text-muted">
                    <div class="avatar-circle me-2">{{ getInitials(creatorUsername) }}</div>
                    <small>{{ creatorUsername }} • {{ formatDate(discussion.createdAt) }}</small>
                </div>
                <p class="lead text-secondary">{{ discussion.description }}</p>
            </div>

            <hr />

            <!-- Comments Section -->
            <div>
                <h4 class="mb-4 text-primary">
                    <i class="bi bi-chat-left-text me-2"></i>Commentaires ({{ comments.length }})
                </h4>

                <div v-if="comments.length === 0" class="alert alert-info">
                    Aucun commentaire pour le moment.
                </div>

                <div v-else class="list-group mb-5">
                    <div 
                        v-for="comment in comments" 
                        :key="comment.id" 
                        class="list-group-item list-group-item-light mb-3 rounded shadow-sm"
                    >
                        <div class="d-flex justify-content-between">
                            <div class="d-flex align-items-center">
                                <div class="avatar-circle me-2">{{ getInitials(comment.username) }}</div>
                                <strong class="me-2">{{ comment.username }}</strong>
                                <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                            </div>
                        </div>
                        <p class="mb-0 mt-2">{{ comment.content }}</p>
                    </div>
                </div>

                <!-- Comment Form -->
                <div class="mt-5">
                    <h5 class="mb-3 text-primary">Ajouter un commentaire</h5>

                    <div v-if="!currentUser" class="alert alert-warning">
                        Vous devez être connecté pour commenter.
                    </div>

                    <form @submit.prevent="submitComment" v-else>
                        <div class="mb-3">
                            <textarea 
                                class="form-control" 
                                rows="3" 
                                v-model="newComment" 
                                placeholder="Écrivez votre commentaire ici..."
                                required
                            ></textarea>
                        </div>
                        <button class="btn btn-primary" :disabled="submitting">
                            <i class="bi bi-send me-1"></i> Envoyer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { getAuth } from 'firebase/auth';
    import { db } from '@/composables/useFirestore';
    import {
        doc,
        getDoc,
        collection,
        query,
        where,
        getDocs,
        orderBy,
        addDoc,
        serverTimestamp
    } from 'firebase/firestore';

    // Route & state
    const route = useRoute();
    const discussionId = route.params.id;
    const discussion = ref({});
    const creatorUsername = ref('Chargement...');
    const comments = ref([]);
    const loading = ref(true);
    const newComment = ref('');
    const submitting = ref(false);
    const userCache = ref({});

    // Auth
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Helpers
    const getInitials = (username) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    };

    // Fetch discussion by ID
    const fetchDiscussion = async () => {
        try {
            const docRef = doc(db, 'Discussion', discussionId);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                discussion.value = {
                    ...data,
                    id: snapshot.id,
                    createdAt: data.createdAt?.toDate() || new Date(),
                };
                await fetchCreatorUsername(data.createdBy);
            }
        } catch (err) {
            console.error('Erreur chargement discussion:', err);
        }
    };

    // Fetch creator's username
    const fetchCreatorUsername = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'Utilisateurs', userId));
            if (userDoc.exists()) {
                creatorUsername.value = userDoc.data().username || 'Utilisateur';
            } else {
                creatorUsername.value = 'Utilisateur inconnu';
            }
        } catch (err) {
            console.error('Erreur nom utilisateur:', err);
            creatorUsername.value = 'Erreur';
        }
    };

    // Fetch comments and user names
    const fetchComments = async () => {
        try {
            const q = query(
                collection(db, 'Messages'),
                where('discussionId', '==', discussionId),
                orderBy('createdAt', 'asc')
            );
            const snapshot = await getDocs(q);

            const commentData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const userId = data.senderId;

                    if (!userCache.value[userId]) {
                        try {
                            const userSnap = await getDoc(doc(db, 'Utilisateurs', userId));
                            userCache.value[userId] = userSnap.exists()
                                ? userSnap.data().username
                                : 'Utilisateur inconnu';
                        } catch (err) {
                            console.error('Erreur chargement utilisateur commentaire:', err);
                            userCache.value[userId] = 'Erreur';
                        }
                    }

                    return {
                        id: docSnap.id,
                        content: data.content,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        username: userCache.value[userId] || 'Utilisateur',
                    };
                })
            );

            comments.value = commentData;
        } catch (err) {
            console.error('Erreur chargement commentaires:', err);
        }
    };

    // Submit new comment
    const submitComment = async () => {
        if (!newComment.value.trim()) return;
        if (!currentUser) return alert('Vous devez être connecté.');

        submitting.value = true;

        try {
            await addDoc(collection(db, 'Messages'), {
                content: newComment.value.trim(),
                createdAt: serverTimestamp(),
                discussionId: discussionId,
                senderId: currentUser.uid
            });

            newComment.value = '';
            await fetchComments(); // Refresh comment list
        } catch (err) {
            console.error('Erreur lors de l\'envoi du commentaire:', err);
            alert("Une erreur est survenue lors de l'envoi du commentaire.");
        } finally {
            submitting.value = false;
        }
    };

    // Lifecycle
    onMounted(async () => {
        loading.value = true;
        await Promise.all([fetchDiscussion(), fetchComments()]);
        loading.value = false;
    });
</script>

<style scoped>
    .avatar-circle {
        width: 30px;
        height: 30px;
        background-color: #e9ecef;
        color: #495057;
        font-weight: bold;
        font-size: 0.75rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
