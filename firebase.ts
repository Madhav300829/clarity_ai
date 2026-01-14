import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// IMPORTANT: Your app's Firebase project configuration should be set
// in environment variables for security and portability.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

/**
 * Initializes Firestore if the configuration is valid.
 * @returns A Firestore instance or null if configuration is missing/invalid.
 */
function initializeDb(): Firestore | null {
    const isFirebaseConfigured = Object.values(firebaseConfig).every(v => v);

    if (isFirebaseConfigured) {
        try {
            const app = initializeApp(firebaseConfig);
            console.log("Firebase initialized for activity logging.");
            return getFirestore(app);
        } catch (error) {
            console.error("Failed to initialize Firebase:", error);
            return null;
        }
    } else {
        console.warn("Firebase configuration is missing or incomplete. Activity logging is disabled.");
        return null;
    }
}

// Initialize Firebase and export the db instance (which may be null).
export const db = initializeDb();
