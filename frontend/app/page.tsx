import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Building,
  Star,
  Zap,
  Target,
  Briefcase,
  CheckCircle,
  Users,
  GraduationCap,
  Award,
  TrendingUp,
} from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue via-vibrant-purple to-vibrant-pink opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-fade-in-up">
              Connect Students with <span className="text-vibrant-yellow">Dream Opportunities</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in-up animation-delay-300">
              StudentHunter bridges the gap between talented students and innovative companies, helping you launch your
              career with confidence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up animation-delay-600">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-vibrant-yellow text-black hover:bg-vibrant-yellow/90 rounded-xl shadow-lg transform transition-all hover:scale-105"
                >
                  Find Jobs
                </Button>
              </Link>
              <Link href="/employers">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-vibrant-purple rounded-xl shadow-lg transform transition-all hover:scale-105"
                >
                  For Employers
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
              How StudentHunter Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform simplifies the job search process for students and recruitment for employers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Create Your Profile",
                description:
                  "Build a comprehensive profile showcasing your skills, experience, and academic achievements",
                icon: Users,
                color: "vibrant-blue",
                step: "01",
              },
              {
                title: "Discover Opportunities",
                description: "Browse through curated job listings tailored to your skills and career interests",
                icon: Target,
                color: "vibrant-purple",
                step: "02",
              },
              {
                title: "Apply & Connect",
                description: "Apply to positions with our streamlined application process and connect with employers",
                icon: CheckCircle,
                color: "vibrant-pink",
                step: "03",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-none bg-gradient-to-br from-white to-muted/50 dark:from-gray-900 dark:to-gray-800"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-${step.color}`}></div>
                <div className="absolute top-6 right-6 text-4xl font-bold opacity-10 group-hover:opacity-20 transition-opacity text-gray-400">
                  {step.step}
                </div>
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-2xl bg-${step.color}/10 text-${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue via-vibrant-purple to-vibrant-pink opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Statistics</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Join thousands of students and employers already using StudentHunter
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Active Students", icon: GraduationCap },
              { number: "500+", label: "Partner Companies", icon: Building },
              { number: "2,000+", label: "Job Placements", icon: Briefcase },
              { number: "95%", label: "Success Rate", icon: TrendingUp },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 transform transition-all hover:scale-105 hover:bg-white/20"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lg text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
              Why Choose StudentHunter?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform offers unique features designed specifically for students and recent graduates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Smart Matching",
                icon: Zap,
                description:
                  "Our AI-powered algorithm connects you with the most relevant opportunities based on your skills and interests",
                color: "vibrant-blue",
              },
              {
                title: "Career Growth",
                icon: Target,
                description: "Access resources, mentorship, and learning paths to boost your professional development",
                color: "vibrant-green",
              },
              {
                title: "Top Companies",
                icon: Building,
                description: "Partner with leading companies across various industries seeking fresh talent",
                color: "vibrant-orange",
              },
              {
                title: "Diverse Opportunities",
                icon: Briefcase,
                description: "Find internships, part-time jobs, and full-time positions tailored to your career stage",
                color: "vibrant-pink",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="text-center group hover:shadow-xl transition-all duration-300 border-none bg-white dark:bg-gray-900"
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-${feature.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                  </div>
                  <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from students and employers who have found success with StudentHunter
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                role: "Computer Science Student",
                quote:
                  "StudentHunter helped me land my dream internship at a top tech company! The AI matching feature connected me with opportunities I wouldn't have found otherwise.",
                image: "/placeholder.svg?height=80&width=80",
                color: "vibrant-blue",
              },
              {
                name: "Emily Chen",
                role: "Marketing Graduate",
                quote:
                  "The career resources and mentorship programs were invaluable for my professional growth. I secured a position at a leading marketing agency within weeks of joining.",
                image: "/placeholder.svg?height=80&width=80",
                color: "vibrant-green",
              },
              {
                name: "Michael Brown",
                role: "HR Manager",
                quote:
                  "As an employer, StudentHunter makes it easy to find talented and motivated students. The quality of candidates has been exceptional, saving us time and resources.",
                image: "/placeholder.svg?height=80&width=80",
                color: "vibrant-orange",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-none"
              >
                <div className={`h-2 w-full bg-${testimonial.color}`}></div>
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                    </div>
                    <div className="mt-auto flex items-center">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-muted-foreground/20">
                        <Image
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end bg-muted/30 py-3 px-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-vibrant-yellow" fill="currentColor" />
                  ))}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Employers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
              Featured Employers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join these leading companies in finding top student talent
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <Image
                  src={`/placeholder-logo.svg`}
                  width="120"
                  height="60"
                  alt={`Company logo ${index + 1}`}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
              Career Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access our library of resources to help you succeed in your job search
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Resume Writing Guide",
                description: "Learn how to craft a standout resume that gets noticed by employers",
                icon: Award,
                color: "vibrant-blue",
              },
              {
                title: "Interview Preparation",
                description: "Master the art of interviewing with our comprehensive guides and practice tools",
                icon: Users,
                color: "vibrant-purple",
              },
              {
                title: "Career Planning",
                description: "Develop a strategic career plan with guidance from industry experts",
                icon: Target,
                color: "vibrant-pink",
              },
            ].map((resource, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-none"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-full bg-${resource.color}/10 flex items-center justify-center mb-4`}
                  >
                    <resource.icon className={`w-6 h-6 text-${resource.color}`} />
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{resource.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href="/resources">
                    <Button
                      variant="outline"
                      className={`group-hover:bg-${resource.color} group-hover:text-white transition-colors duration-300`}
                    >
                      Learn More
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/resources">
              <Button
                size="lg"
                className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300"
              >
                Explore All Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue to-vibrant-purple opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern-bg.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join StudentHunter today and take the first step towards your dream career
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-vibrant-purple hover:bg-vibrant-yellow hover:text-black transition-colors duration-300 rounded-xl shadow-lg"
                >
                  Create Account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-vibrant-purple transition-colors duration-300 rounded-xl shadow-lg"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

