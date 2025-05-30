import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full py-12  bg-white">
      <div className="container  md:px-6 ">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] ">
          <div className="flex flex-col justify-center space-y-4 ">
            <div className="space-y-2 p-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-black dark:text-black bg-clip-padding ">
                Build Your Career Before You Apply
              </h1>
              <p className="max-w-[600px] text-gray-800 dark:text-black-200 md:text-xl">
                Connect with peers, discover events, and build your portfolio with StudentHub - the platform designed
                for student success.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row p-3">
              <Link href="/auth/signup">
                <Button size="lg" className="px-8 py-6 bg-black hover:bg-gray-900 text-white font-semibold text-base shadow-lg transition-all duration-200 hover:shadow-xl hover:translate-y-[-2px] p-5">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8 py-6 border-2 border-black text-black hover:bg-gray-50 font-semibold text-base transition-all duration-200 p-5">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center p-5">
            <div className="relative h-[350px] w-full md:h-[450px] lg:h-[500px] xl:h-[550px] rounded-lg overflow-hidden shadow-xl p-5">
              <img
                src="/placeholder.png?height=650&width=600"
                alt="Students collaborating"
                className="object-contain w-full h-full"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent">
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 rounded-md text-black font-medium text-sm">
                  Success starts here
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}