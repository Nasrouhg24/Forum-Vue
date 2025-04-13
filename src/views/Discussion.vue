<template>
    <div class="container py-4">
        <!-- Titre de la page et statistiques -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="fw-bold text-primary">Discussions</h1>
            <div class="badge bg-info fs-6" v-if="!loading">
                {{ discussions.length }} discussion(s) au total
            </div>
        </div>

        <!-- Barre de recherche et options de tri -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white border-end-0">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input 
                        type="text" 
                        class="form-control border-start-0" 
                        v-model="searchQuery" 
                        placeholder="Rechercher une discussion..."
                        @input="handleSearch"
                    >
                </div>
            </div>
            <div class="col-md-4">
                <div class="input-group shadow-sm">
                    <select class="form-select" v-model="sortOption" @change="handleSort">
                        <option value="newest">
                            Plus récentes d'abord
                        </option>
                        <option value="oldest">
                            Plus anciennes d'abord
                        </option>
                    </select>
                    <span class="input-group-text bg-white">
                        <i class="bi" :class="sortOption === 'newest' ? 'bi-sort-down' : 'bi-sort-up'"></i>
                    </span>
                </div>
            </div>
        </div>

        <!-- Message de chargement -->
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2">Chargement des discussions...</p>
        </div>

        <!-- Message si aucun résultat -->
        <div v-else-if="filteredDiscussions.length === 0" class="text-center my-5">
            <div class="alert alert-info shadow-sm" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                Aucune discussion ne correspond à votre recherche.
            </div>
        </div>

        <!-- Grille de discussions -->
        <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            <div v-for="discussion in paginatedDiscussions" :key="discussion.id" class="col">
                <div class="card h-100 shadow-sm border-0 discussion-card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold text-primary mb-1 discussion-title">{{ discussion.titre }}</h5>
                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar-circle me-2">
                                {{ getInitials(discussion.username) }}
                            </div>
                            <span class="text-muted small">{{ discussion.username }}</span>
                        </div>
                        <div class="card-text description-preview text-secondary">
                            {{ truncateDescription(discussion.description, 150) }}
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center">
                        <div class="text-muted small">
                            <i class="bi bi-clock me-1"></i>
                            {{ formatDate(discussion.createdAt) }}
                        </div>
                        <router-link :to="'/discussion/' + discussion.id" class="btn btn-primary btn-sm">
                            <i class="bi bi-chat-text me-1"></i> Voir
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pagination -->
        <nav v-if="filteredDiscussions.length > discussionsPerPage" class="mt-5">
            <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)" aria-label="Précédent">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <li 
                    v-for="page in displayedPages" 
                    :key="page" 
                    class="page-item" 
                    :class="{ active: page === currentPage }"
                >
                    <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)" aria-label="Suivant">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Section suggestions/tendances -->
        <div class="mt-5 pt-4 border-top" v-if="!loading && discussions.length > 0">
            <h3 class="mb-4 text-primary">
                <i class="bi bi-fire me-2"></i>Discussions tendances
            </h3>
            <div class="row">
                <div class="col-md-4" v-for="discussion in trendingDiscussions" :key="discussion.id">
                    <div class="d-flex align-items-center mb-3 trend-item p-3 rounded">
                        <div class="trend-number me-3">{{ trendingDiscussions.indexOf(discussion) + 1 }}</div>
                        <div>
                            <h6 class="mb-1 fw-bold">{{ discussion.titre }}</h6>
                            <div class="small text-muted">{{ discussion.username }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { db } from '@/composables/useFirestore';
    import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

    // État local
    const discussions = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const sortOption = ref('newest');
    const currentPage = ref(1);
    const discussionsPerPage = 6;
    const usersCache = ref({});

    // Récupérer les discussions depuis Firestore
    const fetchDiscussions = async () => {
        try {
            loading.value = true;
            const discussionsRef = collection(db, 'Discussion');
            const q = query(discussionsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);

            // Récupérer les données des discussions
            const discussionsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    titre: data.titre || 'Sans titre',
                    description: data.description || 'Aucune description',
                    createdAt: data.createdAt?.toDate() || new Date(),
                    createdBy: data.createdBy || '',
                    username: 'Chargement...' // Sera remplacé par le nom d'utilisateur réel
                };
            });

            discussions.value = discussionsData;

            // Récupérer les noms d'utilisateur pour chaque discussion
            await fetchUsernames();
        } catch (error) {
            console.error('Erreur lors du chargement des discussions:', error);
        } finally {
            loading.value = false;
        }
    };

    // Récupérer les noms d'utilisateur pour les créateurs des discussions
    const fetchUsernames = async () => {
        const userIdsToFetch = discussions.value
        .filter(d => d.createdBy && !usersCache.value[d.createdBy])
        .map(d => d.createdBy);

        // Si tous les utilisateurs sont déjà dans le cache, pas besoin de faire des requêtes
        if (userIdsToFetch.length === 0) {
            updateDiscussionsWithUsernames();
            return;
        }

        // Récupérer les données des utilisateurs non encore en cache
        const promises = userIdsToFetch.map(async userId => {
            try {
                const userDoc = await getDoc(doc(db, 'Utilisateurs', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    usersCache.value[userId] = userData.username || 'Utilisateur anonyme';
                } else {
                    usersCache.value[userId] = 'Utilisateur inconnu';
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
                usersCache.value[userId] = 'Erreur de chargement';
            }
        });

        await Promise.all(promises);
        updateDiscussionsWithUsernames();
    };

    // Mettre à jour les discussions avec les noms d'utilisateur du cache
    const updateDiscussionsWithUsernames = () => {
        discussions.value = discussions.value.map(discussion => {
            return {
                ...discussion,
                username: usersCache.value[discussion.createdBy] || 'Utilisateur anonyme'
            };
        });
    };

    // Filtrer les discussions en fonction de la recherche
    const filteredDiscussions = computed(() => {
        if (!searchQuery.value.trim()) {
            return discussions.value;
        }

        const query = searchQuery.value.toLowerCase().trim();
        return discussions.value.filter(discussion => 
            discussion.titre.toLowerCase().includes(query)
        );
    });

    // Trier les discussions
    const sortedDiscussions = computed(() => {
        const sorted = [...filteredDiscussions.value];

        if (sortOption.value === 'oldest') {
            sorted.sort((a, b) => a.createdAt - b.createdAt);
        } else {
            sorted.sort((a, b) => b.createdAt - a.createdAt);
        }

        return sorted;
    });

    // Pagination
    const totalPages = computed(() => {
        return Math.ceil(filteredDiscussions.value.length / discussionsPerPage);
    });

    const paginatedDiscussions = computed(() => {
        const startIndex = (currentPage.value - 1) * discussionsPerPage;
        const endIndex = startIndex + discussionsPerPage;
        return sortedDiscussions.value.slice(startIndex, endIndex);
    });

    // Calculer les pages à afficher dans la pagination
    const displayedPages = computed(() => {
        const maxPagesToShow = 5;
        const pages = [];

        if (totalPages.value <= maxPagesToShow) {
            // Afficher toutes les pages si leur nombre est inférieur à maxPagesToShow
            for (let i = 1; i <= totalPages.value; i++) {
                pages.push(i);
            }
        } else {
            // Calculer les pages à afficher
            let startPage = Math.max(currentPage.value - Math.floor(maxPagesToShow / 2), 1);
            let endPage = startPage + maxPagesToShow - 1;

            if (endPage > totalPages.value) {
                endPage = totalPages.value;
                startPage = Math.max(endPage - maxPagesToShow + 1, 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    });

    // Discussions tendances (exemple: sélectionner les 3 discussions les plus récentes)
    const trendingDiscussions = computed(() => {
        return [...discussions.value]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 3);
    });

    // Méthodes
    const handleSearch = () => {
        currentPage.value = 1; // Réinitialiser à la première page lors d'une recherche
    };

    const handleSort = () => {
        currentPage.value = 1; // Réinitialiser à la première page lors d'un tri
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages.value) return;
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const truncateDescription = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;

        // Tronquer au dernier espace avant maxLength pour ne pas couper un mot
        const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
        return text.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
    };

    const formatDate = (date) => {
        if (!date) return '';

        // Calculer si la date est aujourd'hui, hier ou plus ancienne
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date >= today) {
            return `Aujourd'hui à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (date >= yesterday) {
            return `Hier à ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
            return new Intl.DateTimeFormat('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
    };

    const getInitials = (username) => {
        if (!username) return '?';

        // Extraire les initiales (première lettre du nom)
        return username.charAt(0).toUpperCase();
    };

    // Réinitialiser la page en cas de changement de tri ou de recherche
    watch([searchQuery, sortOption], () => {
        currentPage.value = 1;
    });

    // Charger les discussions au montage du composant
    onMounted(() => {
        fetchDiscussions();
    });
</script>

<style scoped>
    .discussion-title {
        font-size: 1.25rem;
        line-height: 1.4;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .description-preview {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        height: 4.5rem;
        line-height: 1.5;
        color: #6c757d;
    }

    .discussion-card {
        transition: all 0.3s ease;
        border-radius: 12px;
    }

    .discussion-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
    }

    .pagination .page-link {
        color: #0d6efd;
        border-radius: 4px;
        margin: 0 2px;
    }

    .pagination .active .page-link {
        background-color: #0d6efd;
        border-color: #0d6efd;
        color: white;
    }

    .avatar-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #e9ecef;
        color: #495057;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.75rem;
    }

    .trend-item {
        background-color: #f8f9fa;
        transition: all 0.2s ease;
        border-left: 3px solid #0d6efd;
    }

    .trend-item:hover {
        background-color: #e9ecef;
    }

    .trend-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #0d6efd;
        width: 28px;
        text-align: center;
    }
</style>
