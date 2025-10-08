import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Mail, Lock } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";

const API_URL = 'https://thematrix.sravanthskr2004.workers.dev';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Login successful, user:', user.email);
      console.log('Email verified:', user.emailVerified);

      if (!user.emailVerified) {
        toast({
          title: "Email not verified",
          description: "⚠️ Please check your inbox and verify your email first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const idToken = await user.getIdToken();

      console.log('Calling backend to get API key...');

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid,
          idToken: idToken
        })
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API key received:', data.api_key ? 'Yes' : 'No');
        localStorage.setItem('apiKey', data.api_key);
        if (user.email) {
          localStorage.setItem('userEmail', user.email);
        }
        
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
        }
        
        setLocation('/dashboard');
      } else {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        toast({
          title: "Backend error",
          description: `Error (${response.status}): ${errorText || 'Login failed. Make sure the backend endpoints are deployed.'}`,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = "Failed to login. Please check your credentials.";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = '❌ Wrong password! Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = '❌ No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '❌ Invalid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <MatrixRain />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">The Matrix</h1>
          <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-muted-foreground">Sign in to access your dashboard</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" data-testid="label-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" data-testid="label-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  data-testid="checkbox-remember"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
              {isLoading ? "Signing in..." : "Sign In →"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline" data-testid="link-signup">
              Sign up
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
