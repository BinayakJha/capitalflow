import { auth, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithMicrosoft, signOutUser } from './firebase';
import { getRedirectResult } from 'firebase/auth';
import { apiRequest } from './queryClient';

interface AuthResponse {
  success: boolean;
  message?: string;
  userId?: number;
}

// Register user in our backend
export const registerUserWithBackend = async (firebaseId: string, email: string, displayName?: string) => {
  try {
    const response = await apiRequest('POST', '/api/auth/register', {
      firebaseId,
      email,
      displayName: displayName || email.split('@')[0],
      username: email,
      password: "firebase-auth" // Placeholder as we're using Firebase for auth
    });
    
    const data: AuthResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering user with backend:', error);
    return { success: false, message: 'Failed to register with server' };
  }
};

// Login with email and password
export const loginWithEmail = async (email: string, password: string) => {
  const { user, error } = await signInWithEmail(email, password);
  if (error) {
    return { success: false, message: error.message };
  }
  
  if (user) {
    const token = await user.getIdToken();
    const backendResponse = await registerUserWithBackend(user.uid, user.email || email, user.displayName || undefined);
    return { success: true, user, ...backendResponse };
  }
  
  return { success: false, message: 'Unknown error occurred' };
};

// Register with email and password
export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  const { user, error } = await signUpWithEmail(email, password);
  if (error) {
    return { success: false, message: error.message };
  }
  
  if (user) {
    const token = await user.getIdToken();
    const backendResponse = await registerUserWithBackend(user.uid, user.email || email, displayName);
    return { success: true, user, ...backendResponse };
  }
  
  return { success: false, message: 'Unknown error occurred' };
};

// Login with Google
export const loginWithGoogle = async () => {
  const { error } = await signInWithGoogle();
  if (error) {
    return { success: false, message: error.message };
  }
  
  return { success: true };
};

// Login with Microsoft
export const loginWithMicrosoft = async () => {
  const { error } = await signInWithMicrosoft();
  if (error) {
    return { success: false, message: error.message };
  }
  
  return { success: true };
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const token = await result.user.getIdToken();
      const backendResponse = await registerUserWithBackend(
        result.user.uid, 
        result.user.email || '', 
        result.user.displayName || undefined
      );
      return { success: true, user: result.user, ...backendResponse };
    }
    return { success: false, message: 'No redirect result' };
  } catch (error) {
    console.error('Error handling redirect:', error);
    return { success: false, message: (error as Error).message };
  }
};

// Sign out
export const logout = async () => {
  const { error } = await signOutUser();
  if (error) {
    return { success: false, message: error.message };
  }
  
  return { success: true };
};
