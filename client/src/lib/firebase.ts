import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVIonSS6TkpVonMPQ6So1p2lXe5bSbPt8",
  authDomain: "exceldna.firebaseapp.com",
  projectId: "exceldna",
  storageBucket: "exceldna.firebasestorage.app",
  appId: "1:1035151273006:web:6a7f562e50482769fc43bf",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithRedirect(auth, provider);
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User is signed in
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;
      console.log("User signed in:", user.displayName);
    }
  } catch (error: any) {
    console.error("Authentication error:", error.message);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error: any) {
    console.error("Error signing out:", error.message);
  }
};
