import { useEffect } from 'react';
import { AuthContainer } from '@/components/auth/auth-container';
import { LoginForm } from '@/components/auth/login-form';
import { useLocation } from 'wouter';
import { handleRedirectResult } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
      return;
    }

    // Handle redirects from OAuth providers
    const checkRedirect = async () => {
      const result = await handleRedirectResult();
      if (result.success) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        setLocation('/dashboard');
      } else if (result.message !== 'No redirect result') {
        toast({
          title: 'Login failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    };

    checkRedirect();
  }, [isAuthenticated, setLocation, toast]);

  const handleLoginSuccess = () => {
    setLocation('/dashboard');
  };

  return (
    <AuthContainer>
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthContainer>
  );
}
