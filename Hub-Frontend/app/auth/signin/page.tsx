// app/auth/signin/page.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { GraduationCap, Loader2, AlertCircle } from "lucide-react";
import { useMutation } from '@apollo/client';
import { LOGIN, login, LoginResponse } from '@/app/apollo/operations/auth';

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Clear error message when user changes inputs
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage("");
    }
  }, [email, password]);

  const [loginMutation] = useMutation<LoginResponse>(LOGIN, {
    onCompleted: (data) => {
      try {
        const { token, user } = data.login;
        // Use Apollo cache instead of localStorage
        login(token, user);

        // Set redirecting state to show a better UI feedback
        setIsRedirecting(true);

        const roleKey = user.role.toLowerCase();
        const routeMap = {
          admin: "/dashboard/admin",
          student: "/dashboard/student",
          university: "/dashboard/university",
          company: "/dashboard/company",
        };

        const target = routeMap[roleKey as keyof typeof routeMap] || "/dashboard";
        
        // Use replace instead of push to avoid the history.pushState warning
        setTimeout(() => {
          router.replace(target);
        }, 100);
      } catch (err) {
        console.error("Error processing login response:", err);
        setErrorMessage("Something went wrong. Please try again.");
        setIsLoading(false);
        setIsRedirecting(false);
      }
    },
    onError: (error) => {
      console.error("Error signing in:", error);
      setErrorMessage(error.message || "Invalid credentials. Please try again.");
      setIsLoading(false);
      setIsRedirecting(false);
    }
  });

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await loginMutation({
        variables: { email, password }
      });
    } catch (error) {
      // This catch block handles client-side errors - network issues, etc.
      // GraphQL errors are handled in the onError callback
      console.error("Error signing in:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

  // If we're redirecting, show a friendly message
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-5">
        <div className="text-center text-white">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <h2 className="text-xl font-medium">Signing you in...</h2>
          <p className="text-zinc-400 mt-2">You'll be redirected to your dashboard shortly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-5">
      <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2">
        <GraduationCap className="h-6 w-6 text-gray-200" />
        <span className="font-bold inline-block text-gray-200">StudentHub</span>
      </Link>

      <Card className="w-full max-w-md bg-white shadow-lg border border-gray-200">
        <CardHeader className="space-y-1 border-b border-gray-100">
          <CardTitle className="text-2xl font-bold text-zinc-900">Sign in</CardTitle>
          <CardDescription className="text-zinc-600">Enter your email and password to access your account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4 pt-6">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-800 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="m.scott@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="border-zinc-300 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-zinc-500 text-black"
                aria-invalid={errorMessage ? "true" : "false"}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-800 font-medium">Password</Label>
                <Link href="/forgot-password" className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500 text-black"
                aria-invalid={errorMessage ? "true" : "false"}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 pt-6">
            <Button 
              type="submit" 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white transition-colors" 
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
            <div className="text-center text-sm text-zinc-700">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-zinc-900 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}