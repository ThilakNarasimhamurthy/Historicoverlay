'use client';

import Link from "next/link" 
import { GraduationCap } from "lucide-react"
import { OnboardingSteps } from "@/components/onboarding/onboarding-steps"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
        <GraduationCap className="h-6 w-6 text-white" />
        <span className="font-bold inline-block">StudentHub</span>
      </Link>
      
      <OnboardingSteps />
    </div>
  )
}
