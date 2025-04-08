import { db, auth } from "@/composables/useFirestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Fonction d'inscription
export const registerUser = async ({ email, password, username }) => {
  try {
    // Vérifier que Firebase est bien initialisé
    if (!auth) {
      throw new Error("Firebase Auth n'est pas initialisé correctement");
    }

    // Créer l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('Utilisateur créé avec succès :', firebaseUser);

    // Envoyer un e-mail de vérification (optionnel mais recommandé)
    await sendEmailVerification(firebaseUser);

    // Enregistrement des données utilisateur dans Firestore
    await setDoc(doc(db, "Utilisateurs", firebaseUser.uid), {
      uid: firebaseUser.uid,
      username: username,
      email: email,
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
    });

    return firebaseUser;
  } catch (error) {
    console.error("Erreur Firebase :", error);

    // Gestion d'erreurs spécifiques
    if (error.code === 'auth/admin-restricted-operation') {
      throw new Error("Opération restreinte. Vérifiez que la création de compte est activée dans la console Firebase.");
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error("Cette adresse email est déjà utilisée.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Adresse email invalide.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Le mot de passe est trop faible.");
    } else {
      throw new Error(error.message);
    }
  }
};

// Fonction de connexion


//to catch the error {false : error in auth ,true : no error }
export const loginUser = async ({ email, password}) => {

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    return {user:firebaseUser,error : null};
  } catch (error) {
    console.error("Erreur de connexion :", error);


    return {user:null,error };

  }
};
