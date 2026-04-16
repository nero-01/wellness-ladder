"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronLeft, 
  Check, 
  Sparkles, 
  Brain, 
  BarChart3, 
  Download,
  Shield,
  Zap
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const features = [
  {
    icon: Brain,
    title: "AI-Personalized Tasks",
    description: "Tasks adapt to your mood and progress"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed insights and trends over time"
  },
  {
    icon: Download,
    title: "Unlimited History",
    description: "Access your complete wellness journey"
  },
  {
    icon: Sparkles,
    title: "Premium Content",
    description: "Exclusive guided meditations and exercises"
  },
  {
    icon: Shield,
    title: "Priority Support",
    description: "Direct access to wellness coaches"
  },
  {
    icon: Zap,
    title: "Early Access",
    description: "Be first to try new features"
  }
]

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    period: "/month",
    savings: null
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$39.99",
    period: "/year",
    savings: "Save 33%"
  }
]

export default function SubscribePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("yearly")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = async () => {
    setIsProcessing(true)
    
    // Simulate Stripe checkout redirect
    // In production, this would call your API to create a Stripe checkout session
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock success - in production this would redirect to Stripe
    alert("This is a demo! In production, you would be redirected to Stripe Checkout.")
    setIsProcessing(false)
    router.push("/profile")
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Premium</h1>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        {/* Hero */}
        <div 
          className={`text-center mb-8 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Unlock Your Full Potential
          </h2>
          <p className="text-muted-foreground">
            Supercharge your wellness journey with premium features
          </p>
        </div>

        {/* Plan Selection */}
        <div 
          className={`grid grid-cols-2 gap-3 mb-6 transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              {plan.savings && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                  {plan.savings}
                </span>
              )}
              <p className="font-semibold text-foreground">{plan.name}</p>
              <p className="text-lg font-bold text-foreground">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {plan.period}
                </span>
              </p>
            </button>
          ))}
        </div>

        {/* Features List */}
        <Card 
          className={`border-0 shadow-xl bg-card mb-6 transition-all duration-500 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              {"What's"} Included
            </h3>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscribe Button */}
        <div 
          className={`space-y-4 transition-all duration-500 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary text-white border-0"
          >
            {isProcessing ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Start Premium - {plans.find(p => p.id === selectedPlan)?.price}
                {plans.find(p => p.id === selectedPlan)?.period}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. Secure payment via Stripe.
            <br />
            By subscribing, you agree to our{" "}
            <Link href="#" className="text-primary underline">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="text-primary underline">Privacy Policy</Link>
          </p>
        </div>

        {/* Free Tier Info */}
        <Card 
          className={`border-0 shadow-sm bg-secondary/50 mt-6 transition-all duration-500 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Free tier always available
                </p>
                <p className="text-xs text-muted-foreground">
                  1 task/day, basic tracking, offline support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
