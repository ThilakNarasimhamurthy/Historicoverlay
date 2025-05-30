import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 text-center bg-blue-100">
      <h2 className="text-3xl font-bold">Join StudentHub Today</h2>
      <p className="mt-4 text-lg">Empowering students to connect, share, and grow.</p>
      <button className="mt-6 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
        Get Started
      </button>
    </section>
  );
}
