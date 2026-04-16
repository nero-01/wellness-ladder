"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Crown, Calendar, TrendingUp, Target } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { StreakBadge } from "@/components/wellness"
import { useStreak } from "@/hooks/use-streak"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)
  const { streakData, isLoaded } = useStreak()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate chart data from mood history (or mock data for demo)
  const chartData = useMemo(() => {
    if (streakData.moodHistory.length > 0) {
      return streakData.moodHistory.slice(-7).map(item => ({
        day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
        mood: item.mood
      }))
    }
    // Demo data if no history
    return [
      { day: "Mon", mood: 3 },
      { day: "Tue", mood: 4 },
      { day: "Wed", mood: 3 },
      { day: "Thu", mood: 5 },
      { day: "Fri", mood: 4 },
      { day: "Sat", mood: 4 },
      { day: "Sun", mood: 5 }
    ]
  }, [streakData.moodHistory])

  const stats = [
    {
      icon: Calendar,
      label: "Current Streak",
      value: `${streakData.currentStreak} days`
    },
    {
      icon: Target,
      label: "Total Completed",
      value: `${streakData.totalCompleted} tasks`
    },
    {
      icon: TrendingUp,
      label: "Avg Mood",
      value: streakData.moodHistory.length > 0
        ? (streakData.moodHistory.reduce((acc, m) => acc + m.mood, 0) / streakData.moodHistory.length).toFixed(1)
        : "4.0"
    }
  ]

  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/task">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="font-semibold text-foreground">Your Progress</h1>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 pb-8">
        {/* Profile Card */}
        <Card 
          className={`border-0 shadow-xl bg-card mb-6 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardContent className="p-6 text-center">
            <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white font-bold">W</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Wellness Climber</h2>
            <p className="text-sm text-muted-foreground mb-4">Building healthy habits, one step at a time</p>
            <StreakBadge days={streakData.currentStreak || 1} size="lg" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div 
          className={`grid grid-cols-3 gap-3 mb-6 transition-all duration-500 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {stats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm bg-card">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mood Chart */}
        <Card 
          className={`border-0 shadow-xl bg-card mb-6 transition-all duration-500 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Weekly Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.875rem"
                    }}
                    formatter={(value: number) => {
                      const labels = ["", "Sad", "Down", "Okay", "Good", "Great"]
                      return [labels[value] || value, "Mood"]
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="hsl(262, 83%, 58%)" 
                    strokeWidth={2}
                    fill="url(#moodGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Premium CTA */}
        <Card 
          className={`border-0 shadow-xl bg-gradient-to-br from-primary/10 to-accent/20 mb-6 transition-all duration-500 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Unlock Premium</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get personalized AI tasks, unlimited history, and advanced insights.
                </p>
                <Link href="/subscribe">
                  <Button className="w-full h-12 rounded-2xl gradient-primary text-white border-0 font-semibold">
                    Upgrade for $4.99/month
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div 
          className={`flex gap-4 transition-all duration-500 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link href="/task" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-2xl">
              Back to Task
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-2xl">
              Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
