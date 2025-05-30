// app/components/RoleBasedLayout.tsx
'use client';

import { ReactNode } from "react";
import  ProtectedRoute  from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface RoleBasedLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallbackUrl?: string;
}

export function RoleBasedLayout({ 
  children, 
  allowedRoles = [], 
  fallbackUrl = '/auth/signin' 
}: RoleBasedLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles} fallbackUrl={fallbackUrl}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}