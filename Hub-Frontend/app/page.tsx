import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, ChevronRight, ExternalLink } from "lucide-react"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/shared/footer"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black text-white backdrop-blur-sm supports-[backdrop-filter]:bg-black/90 px-5">
        <div className="container flex h-16 items-center px-5 justify-between">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-white" />
            <span className="font-bold inline-block text-white">StudentHub</span>
          </Link>
          
          {/* Navigation in the center */}
          <nav className="hidden md:flex gap-8 px-5 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="#features"
              className="relative flex items-center text-sm font-medium text-gray-300 transition-colors hover:text-white group px-5 py-5"
            >
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="relative flex items-center text-sm font-medium text-gray-300 transition-colors hover:text-white group px-5 py-5"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          {/* Buttons on the right */}
          <div className="flex items-center space-x-4 px-5">
            <Link href="/auth/signin">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-gray-800 px-5"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button 
                className="bg-white text-black hover:bg-gray-100 relative group overflow-hidden px-5 font-medium"
              >
                <span className="relative z-10 flex items-center">
                  Sign Up
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </header>
      
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  )
}