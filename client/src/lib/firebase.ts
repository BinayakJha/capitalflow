import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, OAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase configuration is valid
const isFirebaseConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.projectId && 
         firebaseConfig.appId;
};

// Log warning if Firebase is not properly configured
if (!isFirebaseConfigValid()) {
  console.warn('Firebase configuration is incomplete. Authentication will not work properly.');
  console.warn('Please make sure you have added the following environment variables:');
  console.warn('- VITE_FIREBASE_API_KEY');
  console.warn('- VITE_FIREBASE_PROJECT_ID');
  console.warn('- VITE_FIREBASE_APP_ID');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Microsoft Auth Provider
const microsoftProvider = new OAuthProvider('microsoft.com');

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Sign in with Microsoft
export const signInWithMicrosoft = async () => {
  try {
    await signInWithRedirect(auth, microsoftProvider);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

export { auth };
