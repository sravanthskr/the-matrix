import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Mail, ArrowLeft } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: "Success",
        description: "Password reset email sent! Please check your inbox.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send password reset email.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
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
          <h2 className="text-2xl font-semibold mb-2">Reset your password</h2>
          <p className="text-muted-foreground">Enter your email to receive a password reset link</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
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

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-reset">
                {isLoading ? "Sending..." : "Send Reset Link →"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                className="w-full"
                data-testid="button-try-again"
              >
                Try another email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1" data-testid="link-back-login">
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
