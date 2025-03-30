import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { loginWithEmail, loginWithGoogle, loginWithMicrosoft } from '@/lib/auth';
import { useLocation } from 'wouter';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await loginWithEmail(values.email, values.password);
      
      if (result.success) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        onSuccess();
      } else {
        toast({
          title: 'Login failed',
          description: result.message || 'Please check your credentials and try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: (error as Error).message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        toast({
          title: 'Login failed',
          description: result.message || 'Failed to login with Google',
          variant: 'destructive',
        });
      }
      // Successful redirect will happen automatically
    } catch (error) {
      toast({
        title: 'Login failed',
        description: (error as Error).message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithMicrosoft();
      if (!result.success) {
        toast({
          title: 'Login failed',
          description: result.message || 'Failed to login with Microsoft',
          variant: 'destructive',
        });
      }
      // Successful redirect will happen automatically
    } catch (error) {
      toast({
        title: 'Login failed',
        description: (error as Error).message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="email" 
                    autoComplete="email" 
                    disabled={isLoading} 
                    placeholder="yourname@example.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    autoComplete="current-password" 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
              )}
            />

            <div className="text-sm">
              <button 
                type="button"
                className="font-medium text-primary hover:text-primary/90"
                onClick={() => setLocation('/forgot-password')}
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading} 
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
          </svg>
        </Button>

        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading} 
          onClick={handleMicrosoftSignIn}
          className="w-full"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0,0v11.408h11.408V0H0z M12.592,0v11.408H24V0H12.592z M0,12.592V24h11.408V12.592H0z M12.592,12.592V24H24V12.592H12.592z" />
          </svg>
        </Button>
      </div>

      <div className="text-sm text-center mt-6">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:text-primary/90"
            onClick={() => setLocation('/signup')}
            disabled={isLoading}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
