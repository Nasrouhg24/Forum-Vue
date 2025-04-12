<template>
<div class="container my-5">

<div v-if="isLoading" class="d-flex justify-content-center align-items-center min-vh-50">
<div class="spinner-border text-dark" role="status">
    <span class="visually-hidden">Loading...</span>
</div>
</div>

<div v-if="error" class="alert alert-danger" role="alert">
{{ error }}
</div>

<div v-if="successMessage" class="alert alert-success" role="alert">
{{ successMessage }}
</div>

<div v-if="!isLoading && user" class="row">
<div class="col-md-4 mb-4">
    <div class="card border-dark">
    <div class="card-body text-center">
        <div class="position-relative mb-3">
        <div class="profile-image-container">
            <img 
            :src="profileImageUrl || '/default-avatar.png'" 
            class="rounded-circle img-fluid profile-image"
            alt="Profile picture"
            />
            <div class="profile-image-overlay" @click="triggerImageUpload">
            <i class="bi bi-camera-fill"></i>
            </div>
        </div>
        <input 
            type="file" 
            ref="imageInput" 
            @change="handleImageUpload" 
            accept="image/*" 
            style="display: none;"
        />
        </div>
        <h3 class="card-title mb-0">{{ user.username }}</h3>
        <p class="text-muted">Member since {{ formatDate(user.createdAt) }}</p>
        
        <div class="row mt-4">
        <div class="col">
            <p class="mb-0 fw-bold">{{ discussionsCount }}</p>
            <p class="text-muted">Discussions</p>
        </div>
        <div class="col">
            <p class="mb-0 fw-bold">{{ responsesCount }}</p>
            <p class="text-muted">Responses</p>
        </div>
        </div>
    </div>
    </div>
</div>

<div class="col-md-8">
    <div class="card border-dark mb-4">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Profile Information</h4>
        <button 
        class="btn btn-outline-dark btn-sm" 
        @click="editMode.profile = !editMode.profile"
        >
        {{ editMode.profile ? 'Cancel' : 'Edit Profile' }}
        </button>
    </div>
    
    <div class="card-body" v-if="!editMode.profile">
        <div class="row mb-3">
        <div class="col-md-4 fw-bold">Username:</div>
        <div class="col-md-8">{{ user.username }}</div>
        </div>
        <div class="row mb-3">
        <div class="col-md-4 fw-bold">Email:</div>
        <div class="col-md-8">{{ user.email }}</div>
        </div>
        <div class="row mb-3">
        <div class="col-md-4 fw-bold">Email Verified:</div>
        <div class="col-md-8">
            <span v-if="user.emailVerified" class="badge bg-success">Verified</span>
            <span v-else class="badge bg-warning">Not Verified</span>
            <button 
            v-if="!user.emailVerified" 
            class="btn btn-link btn-sm text-dark p-0 ms-2"
            @click="sendVerificationEmail"
            >
            Send Verification Email
            </button>
        </div>
        </div>
    </div>

    <!-- Edit mode -->
    <div class="card-body" v-else>
        <form @submit.prevent="updateProfile">
        <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input 
            type="text" 
            class="form-control border-dark" 
            id="username"
            v-model="formData.username"
            required
            >
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input 
            type="email" 
            class="form-control border-dark" 
            id="email"
            v-model="formData.email"
            required
            >
            <small class="text-muted">Changing email will require re-verification.</small>
        </div>
        <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-dark" :disabled="isUpdating">
            <span v-if="isUpdating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Save Changes
            </button>
        </div>
        </form>
    </div>
    </div>

    <!-- Password change card -->
    <div class="card border-dark">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Security</h4>
        <button 
        class="btn btn-outline-dark btn-sm" 
        @click="editMode.password = !editMode.password"
        >
        {{ editMode.password ? 'Cancel' : 'Change Password' }}
        </button>
    </div>
    
    <!-- View mode -->
    <div class="card-body" v-if="!editMode.password">
        <p class="text-muted mb-0">Your password is securely stored. Use the Change Password button to update it.</p>
    </div>

    <!-- Edit mode -->
    <div class="card-body" v-else>
        <form @submit.prevent="updatePassword">
        <div class="mb-3">
            <label for="currentPassword" class="form-label">Current Password</label>
            <input 
            type="password" 
            class="form-control border-dark" 
            id="currentPassword"
            v-model="passwordData.currentPassword"
            required
            >
        </div>
        <div class="mb-3">
            <label for="newPassword" class="form-label">New Password</label>
            <input 
            type="password" 
            class="form-control border-dark" 
            id="newPassword"
            v-model="passwordData.newPassword"
            required
            >
            <small class="text-muted">Password must be at least 6 characters long.</small>
        </div>
        <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm New Password</label>
            <input 
            type="password" 
            class="form-control border-dark" 
            id="confirmPassword"
            v-model="passwordData.confirmPassword"
            required
            >
        </div>
        <div class="d-flex justify-content-end">
            <button 
            type="submit" 
            class="btn btn-dark" 
            :disabled="isPasswordUpdating || !isPasswordValid"
            >
            <span v-if="isPasswordUpdating" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Update Password
            </button>
        </div>
        </form>
    </div>
    </div>
</div>
</div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  getAuth, 
  updateEmail, 
  updatePassword as firebaseUpdatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  sendEmailVerification 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/composables/useFirestore'; // Ensure `storage` is imported
import { useRouter } from 'vue-router';

const router = useRouter();

const auth = getAuth();

const user = ref(null);
const isLoading = ref(true);
const error = ref('');
const successMessage = ref('');
const isUpdating = ref(false);
const isPasswordUpdating = ref(false);
const discussionsCount = ref(0);
const responsesCount = ref(0);
const profileImageUrl = ref('');

const formData = ref({
  username: '',
  email: ''
});

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const editMode = ref({
  profile: false,
  password: false
});

const imageInput = ref(null);

const isPasswordValid = computed(() => {
  return (
    passwordData.value.currentPassword &&
    passwordData.value.newPassword &&
    passwordData.value.newPassword === passwordData.value.confirmPassword &&
    passwordData.value.newPassword.length >= 6
  );
});

// Fetch user data
const fetchUserData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'Utilisateurs', currentUser.uid));

    if (userDoc.exists()) {
      user.value = { id: userDoc.id, ...userDoc.data() };
      formData.value.username = user.value.username;
      formData.value.email = user.value.email;

      // Get profile image if exists
      if (user.value.profileImage) {
        profileImageUrl.value = user.value.profileImage;
      }

      // Count discussions
      const discussionsQuery = query(
        collection(db, 'Discussion'),
        where('createdBy', '==', currentUser.uid)
      );
      const discussionsSnapshot = await getDocs(discussionsQuery);
      discussionsCount.value = discussionsSnapshot.size;

      // Count responses
      const responsesQuery = query(
        collection(db, 'Responses'),
        where('createdBy', '==', currentUser.uid)
      );
      const responsesSnapshot = await getDocs(responsesQuery);
      responsesCount.value = responsesSnapshot.size;
    } else {
      error.value = 'User profile not found.';
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    error.value = 'Failed to load profile data. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Update profile information
const updateProfile = async () => {
  isUpdating.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Update username in Firestore
    await updateDoc(doc(db, 'Utilisateurs', currentUser.uid), {
      username: formData.value.username,
      updatedAt: serverTimestamp()
    });

    // If email changed, update it in Firebase Auth
    if (formData.value.email !== user.value.email) {
      await updateEmail(currentUser, formData.value.email);

      // Update email in Firestore as well
      await updateDoc(doc(db, 'Utilisateurs', currentUser.uid), {
        email: formData.value.email,
        emailVerified: false
      });

      // Send verification email
      await sendEmailVerification(currentUser);
      successMessage.value = 'Profile updated successfully. Please verify your new email address.';
    } else {
      successMessage.value = 'Profile updated successfully.';
    }
    await fetchUserData();

    // Exit edit mode
    editMode.value.profile = false;
  } catch (err) {
    console.error('Error updating profile:', err);
    error.value = err.message || 'Failed to update profile. Please try again.';
  } finally {
    isUpdating.value = false;
  }
};

// Update password
const updatePassword = async () => {
  isPasswordUpdating.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordData.value.currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);

    // Update password
    await firebaseUpdatePassword(currentUser, passwordData.value.newPassword);

    successMessage.value = 'Password updated successfully.';

    // Reset form and exit edit mode
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    editMode.value.password = false;
  } catch (err) {
    console.error('Error updating password:', err);
    if (err.code === 'auth/wrong-password') {
      error.value = 'Current password is incorrect.';
    } else {
      error.value = err.message || 'Failed to update password. Please try again.';
    }
  } finally {
    isPasswordUpdating.value = false;
  }
};

// Send verification email
const sendVerificationEmail = async () => {
  try {
    const currentUser = auth.currentUser;

    if (currentUser) {
      await sendEmailVerification(currentUser);
      successMessage.value = 'Verification email sent. Please check your inbox.';
    }
  } catch (err) {
    console.error('Error sending verification email:', err);
    error.value = err.message || 'Failed to send verification email. Please try again later.';
  }
};

// Handle profile image upload
const triggerImageUpload = () => {
  imageInput.value.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Please upload a valid image file (JPEG, PNG, or GIF).';
    return;
  }

  isUpdating.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    const storageReference = storageRef(
      storage, 
      `profile-images/${currentUser.uid}/${Date.now()}-${file.name}`
    );

    await uploadBytes(storageReference, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageReference);

    // Update Firestore with image URL
    await updateDoc(doc(db, 'Utilisateurs', currentUser.uid), {
      profileImage: downloadURL,
      updatedAt: serverTimestamp()
    });

    profileImageUrl.value = downloadURL;
    successMessage.value = 'Profile image updated successfully.';
  } catch (err) {
    console.error('Error uploading profile image:', err);
    error.value = err.message || 'Failed to upload profile image. Please try again.';
  } finally {
    isUpdating.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  if (timestamp.toDate) {
    timestamp = timestamp.toDate();
  }

  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

onMounted(() => {
  fetchUserData();
});
</script>

<style scoped>
.profile-image-container {
position: relative;
width: 150px;
height: 150px;
margin: 0 auto;
overflow: hidden;
}

.profile-image {
width: 100%;
height: 100%;
object-fit: cover;
}

.profile-image-overlay {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
justify-content: center;
align-items: center;
color: white;
font-size: 1.5rem;
opacity: 0;
transition: opacity 0.3s ease;
cursor: pointer;
border-radius: 50%;
}

.profile-image-container:hover .profile-image-overlay {
opacity: 1;
}

.card {
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.min-vh-50 {
min-height: 50vh;
}
</style>