import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB527krYCNwhXO2U3aMtvuXqJ6a19WyXIw",
  authDomain: "forum-90728.firebaseapp.com",
  projectId: "forum-90728",
  storageBucket: "forum-90728.firebasestorage.app",
  messagingSenderId: "611404059044",
  appId: "1:611404059044:web:fdf1de883fd5680a2bb131",
  measurementId: "G-WB2RW7PVJX"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig); // Vérifie que cette ligne est exécutée correctement
const db = getFirestore(app);  // Accès à Firestore
const auth = getAuth(app);    // Accès à Auth

export { db, auth };
