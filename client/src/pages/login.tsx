import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";

type Mode = "signin" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, session, needsOnboarding } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (session) {
      navigate(needsOnboarding ? "/onboarding" : "/");
    }
  }, [session, needsOnboarding, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error("Email and password are required.");
        return;
      }

      if (mode === "signup") {
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters long.");
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          return;
        }
        if (!name.trim()) {
          toast.error("Please provide your full name.");
          return;
        }
        await signUp({ email, password, name: name.trim() });
        toast.success("Account created! Please check your inbox for verification if required.");
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg border-border shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-fit rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            NxtWave Workflow
          </div>
          <CardTitle className="text-3xl font-semibold text-foreground">
            {mode === "signin" ? "Secure Login" : "Create Your Account"}
          </CardTitle>
          <CardDescription className="text-sm">
            {mode === "signin"
              ? "Use your corporate credentials to access the workflow and analytics console."
              : "Set up your account to begin onboarding into the NxtWave hierarchy."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isLoading}
                  required={mode === "signup"}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nxtwave.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have access?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-6 grid gap-2 rounded-md border border-dashed border-border bg-background/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold uppercase tracking-wide text-foreground/70">Demo credentials</p>
            <p>
              <strong>Employee:</strong> awais@nxtwave.com / <span className="font-mono">employee123</span>
            </p>
            <p>
              <strong>Manager:</strong> ravi@nxtwave.com / <span className="font-mono">manager123</span>
            </p>
            <p>
              <strong>Director:</strong> suresh@nxtwave.com / <span className="font-mono">director123</span>
            </p>
            <p>
              <strong>CEO:</strong> ceo@nxtwave.com / <span className="font-mono">ceo12345</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
