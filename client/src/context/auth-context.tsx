import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { logout } from '@/lib/auth';
import { useLocation } from 'wouter';

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<{ success: boolean; message?: string }>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => ({ success: false }),
});

// Custom hook to use the auth context
const useAuthContext = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    // Unsubscribe on cleanup
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setLocation('/login');
    }
    return result;
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to check if user is authenticated for protected routes
const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return { isLoading };
};

// Export components and hooks
export { AuthProvider, useAuthContext as useAuth, useRequireAuth };
