"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Mic, Sparkles, WifiOff } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { wellnessWebPrimary } from "@/lib/wellness-feedback"
import { useEffect, useState } from "react"

const features = [
  {
    icon: Calendar,
    title: "1 Task/Day",
    description: "Just one small step to focus on"
  },
  {
    icon: Mic,
    title: "Voice Guided",
    description: "Calming audio instructions"
  },
  {
    icon: Sparkles,
    title: "AI Personalized",
    description: "Tasks adapt to your mood"
  },
  {
    icon: WifiOff,
    title: "Offline Ready",
    description: "Works without internet"
  }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-foreground">Wellness</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <main className="px-6 pt-8 pb-12">
        <div 
          className={`max-w-md mx-auto text-center transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-4xl font-bold text-foreground leading-tight text-balance mb-4">
            Bite-Size Wellness Ladder
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed text-balance mb-8">
            One tiny self-care step daily. Unlock the next only when done. Build habits effortlessly.
          </p>

          {/* CTA Button */}
          <Link
            href="/task"
            onClick={() => wellnessWebPrimary()}
            className="inline-block w-full max-w-xs"
          >
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary hover:opacity-90 transition-opacity text-white border-0 shadow-lg shadow-primary/25"
            >
              Start Your Ladder
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div 
          className={`max-w-md mx-auto mt-12 grid grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className={`border-0 shadow-sm bg-card/80 backdrop-blur-sm transition-all duration-500`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <CardContent className="p-4 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-secondary mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Preview Illustration */}
        <div 
          className={`max-w-xs mx-auto mt-12 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Card className="border-0 shadow-xl bg-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                    <span className="text-sm">Day 3</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Your Progress</span>
                </div>
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="bg-secondary rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">{"Today's Task"}</p>
                <p className="font-medium text-foreground">Take 3 deep breaths</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className={`px-6 py-8 border-t border-border transition-all duration-700 delay-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-md mx-auto">
          {/* App Store Badges */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-10 px-4 rounded-lg bg-foreground flex items-center gap-2">
              <svg className="h-5 w-5 text-background" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-background/70 leading-none">Download on the</p>
                <p className="text-xs font-semibold text-background leading-tight">App Store</p>
              </div>
            </div>
            <div className="h-10 px-4 rounded-lg bg-foreground flex items-center gap-2">
              <svg className="h-5 w-5 text-background" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] text-background/70 leading-none">Get it on</p>
                <p className="text-xs font-semibold text-background leading-tight">Google Play</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            2026 Wellness Ladder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
