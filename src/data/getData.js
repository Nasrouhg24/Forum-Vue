import { db } from "@/composables/useFirestore";
import { collection, getDocs , query, where} from "firebase/firestore";


export const getDiscussions = async () => {
  try {
    console.log("Fetching discussions...");
    const querySnapshot = await getDocs(collection(db, "Discussion"));

    if (querySnapshot.empty) {
      console.warn("No discussions found.");
      return [];
    }

    const discussions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("Fetched discussions:", discussions); // Log the discussions

    return discussions;
  } catch (error) {
    console.error("Error getting discussions:", error);
    return [];
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = {};

    querySnapshot.docs.forEach(doc => {
      users[doc.id] = { id: doc.id, ...doc.data() };
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {};
  }
};




export const getUserById = async (uid) => {
  try {
    console.log("Fetching user with UID:", uid);

    // Requête pour chercher un utilisateur avec le champ `uid` correspondant
    const usersCollection = collection(db, "Utilisateurs");
    const q = query(usersCollection, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Prendre le premier document trouvé
      console.log("User found:", userDoc.data());
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.warn("User not found for UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};


