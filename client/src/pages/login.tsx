import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await login(email);
      toast.success('Login successful!');
      setLocation('/');
    } catch (error) {
      toast.error('Login failed. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-4">
            <h1 className="text-3xl font-semibold text-foreground">NxtWave</h1>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email to access the workflow dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nxtwave.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="input-email"
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-muted-foreground text-center">Demo accounts:</p>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p><strong>Employee:</strong> awais@nxtwave.com</p>
                <p><strong>Manager:</strong> ravi@nxtwave.com</p>
                <p><strong>Director:</strong> suresh@nxtwave.com</p>
                <p><strong>CEO:</strong> ceo@nxtwave.com</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
