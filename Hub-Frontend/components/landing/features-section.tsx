import { Calendar, MapPin, Users, Award, Briefcase } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-16 md:py-24 bg-slate-700 text-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-white">
              Everything You Need to Succeed
            </h2>
            <p className="max-w-[900px] text-slate-200 md:text-xl/relaxed mx-auto">
              StudentHub provides all the tools you need to build your career portfolio before you even start applying
              for jobs.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 py-8">
          {/* Event Discovery */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border border-slate-600 p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-slate-800/50 w-64">
            <div className="rounded-full bg-blue-500/20 p-3">
              <Calendar className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-center">Event Discovery</h3>
            <p className="text-center text-slate-300">
              Find hackathons, workshops, and networking events tailored to your interests.
            </p>
          </div>
          
          {/* Inter-University Connectivity */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border border-slate-600 p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-slate-800/50 w-64">
            <div className="rounded-full bg-blue-500/20 p-3">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-center">Inter-University Connectivity</h3>
            <p className="text-center text-slate-300">
              Connect with peers from other universities to collaborate on projects.
            </p>
          </div>
          
          {/* Geolocation */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border border-slate-600 p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-slate-800/50 w-64">
            <div className="rounded-full bg-blue-500/20 p-3">
              <MapPin className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-center">Geolocation</h3>
            <p className="text-center text-slate-300">
              Discover events happening near you with our geolocation feature.
            </p>
          </div>
          
          {/* Company Connections */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border border-slate-600 p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-slate-800/50 w-64">
            <div className="rounded-full bg-blue-500/20 p-3">
              <Briefcase className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-center">Company Connections</h3>
            <p className="text-center text-slate-300">
              Connect with companies and recruiters at university-sponsored events.
            </p>
          </div>
          
          {/* Portfolio Builder */}
          <div className="flex flex-col items-center space-y-4 rounded-lg border border-slate-600 p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md bg-slate-800/50 w-64">
            <div className="rounded-full bg-blue-500/20 p-3">
              <Award className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-center">Portfolio Builder</h3>
            <p className="text-center text-slate-300">
              Track your achievements and build a professional portfolio to showcase your skills.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection;