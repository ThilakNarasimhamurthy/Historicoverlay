'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { IS_LOGGED_IN } from '@/app/apollo/operations/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

// Add a small delay to ensure Apollo has time to restore auth state
const AUTH_CHECK_DELAY = 10; // ms

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Get current user from auth system
  const { data: authData, loading: authLoading } = useQuery(IS_LOGGED_IN, {
    fetchPolicy: 'cache-and-network',
  });
  
  const currentUser = authData?.currentUser;
  
  useEffect(() => {
    // Don't do anything while actively loading
    if (authLoading) return;
    
    // Use a timeout to allow Apollo to restore auth state from storage
    const timer = setTimeout(() => {
      if (!currentUser) {
        // No user found, redirect to sign in
        console.log('ProtectedRoute: No user found, redirecting to sign in');
        router.push('/auth/signin');
        setIsChecking(false);
        return;
      }
      
      // Check if user has an allowed role
      const userRole = currentUser.role?.toLowerCase() || '';
      const hasAllowedRole = allowedRoles.includes(userRole);
      
      if (!hasAllowedRole) {
        // User doesn't have an allowed role, redirect to dashboard
        console.log('ProtectedRoute: User does not have allowed role, redirecting to dashboard');
        router.push('/dashboard');
        setIsChecking(false);
        return;
      }
      
      // User is authenticated and authorized
      setIsAuthorized(true);
      setIsChecking(false);
    }, AUTH_CHECK_DELAY);
    
    return () => clearTimeout(timer);
  }, [authLoading, currentUser, router, allowedRoles]);
  
  // Show loading state while checking
  if (isChecking || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying your account...</p>
        </div>
      </div>
    );
  }
  
  // If authorized, render children
  return isAuthorized ? <>{children}</> : null;
}