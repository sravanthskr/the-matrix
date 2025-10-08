import { useState } from "react";
import { useLocation } from "wouter";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Mail, Lock } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";

// List of allowed email domains
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'aol.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
];

// Function to validate email domain
const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email domain
    if (!isValidEmailDomain(email)) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use a valid email from providers like Gmail, Yahoo, Outlook, etc. Temporary emails are not allowed.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      toast({
        title: "Success",
        description: "Account created! Please check your email to verify your account.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <MatrixRain />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">The Matrix</h1>
          <h2 className="text-2xl font-semibold mb-2">Create your account</h2>
          <p className="text-muted-foreground">Get your API key in minutes</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSignup} className="space-y-6">
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  minLength={6}
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" data-testid="label-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signup">
              {isLoading ? "Creating account..." : "Sign Up →"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              Login here
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
