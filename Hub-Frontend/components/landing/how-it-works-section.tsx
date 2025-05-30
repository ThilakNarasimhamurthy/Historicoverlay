import { Check } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple Steps to Success</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Getting started with StudentHub is easy. Follow these simple steps to begin your journey.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="text-xl font-bold">Sign Up & Choose Role</h3>
            <p className="text-center text-muted-foreground">
              Create your account and select your role as a student, admin, or event organizer.
            </p>
            <ul className="space-y-2 text-sm text-left w-full">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Quick registration process</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Verify with university email</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Role-based permissions</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="text-xl font-bold">Personalize Your Experience</h3>
            <p className="text-center text-muted-foreground">
              Select your interests, goals, and preferences to get personalized recommendations.
            </p>
            <ul className="space-y-2 text-sm text-left w-full">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Choose your interests</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Set career goals</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Connect with peers</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-bold">Explore & Engage</h3>
            <p className="text-center text-muted-foreground">
              Discover events, connect with peers, and build your professional network.
            </p>
            <ul className="space-y-2 text-sm text-left w-full">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Register for events</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Share posts and resources</span>
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Build your portfolio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
