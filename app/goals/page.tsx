"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Check, Target, Calendar, Bell } from "lucide-react"
import Link from "next/link"

export default function Goals() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Daily Meditation",
      description: "Meditate for 10 minutes every day",
      category: "Mindfulness",
      progress: 85,
      streak: 12,
      target: 30,
      frequency: "Daily",
      completed: false,
    },
    {
      id: 2,
      title: "Gratitude Journal",
      description: "Write 3 things I'm grateful for",
      category: "Journaling",
      progress: 60,
      streak: 8,
      target: 21,
      frequency: "Daily",
      completed: false,
    },
    {
      id: 3,
      title: "Exercise",
      description: "30 minutes of physical activity",
      category: "Physical Health",
      progress: 40,
      streak: 3,
      target: 14,
      frequency: "Daily",
      completed: true,
    },
    {
      id: 4,
      title: "Read Mental Health Book",
      description: "Read for 20 minutes daily",
      category: "Learning",
      progress: 25,
      streak: 5,
      target: 30,
      frequency: "Daily",
      completed: false,
    },
  ])

  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    target: 7,
    frequency: "Daily",
  })

  const categories = ["Mindfulness", "Journaling", "Physical Health", "Learning", "Social", "Sleep"]
  const frequencies = ["Daily", "Weekly", "Monthly"]

  const toggleGoalCompletion = (goalId: number) => {
    setGoals(goals.map((goal) => (goal.id === goalId ? { ...goal, completed: !goal.completed } : goal)))
  }

  const addGoal = () => {
    if (newGoal.title && newGoal.category) {
      const goal = {
        id: Date.now(),
        ...newGoal,
        progress: 0,
        streak: 0,
        completed: false,
      }
      setGoals([...goals, goal])
      setNewGoal({
        title: "",
        description: "",
        category: "",
        target: 7,
        frequency: "Daily",
      })
      setShowAddGoal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Wellness Goals</h1>
            <p className="text-gray-600">Track your mental health objectives</p>
          </div>
          <Button onClick={() => setShowAddGoal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>

        {/* Today's Goals */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Goals
            </CardTitle>
            <CardDescription>Complete your daily wellness activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {goals
                .filter((goal) => goal.frequency === "Daily")
                .map((goal) => (
                  <div key={goal.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Button
                      variant={goal.completed ? "default" : "outline"}
                      size="icon"
                      onClick={() => toggleGoalCompletion(goal.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${goal.completed ? "line-through text-gray-500" : ""}`}>
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <Badge variant="outline">{goal.category}</Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{goal.streak} day streak</div>
                      <div className="text-xs text-gray-500">🔥</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                  </div>
                  <Badge variant="outline">{goal.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {Math.round((goal.progress / 100) * goal.target)}/{goal.target} days
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{goal.streak} day streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{goal.frequency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-indigo-200">
            <CardHeader>
              <CardTitle>Add New Goal</CardTitle>
              <CardDescription>Create a new wellness objective</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Goal Title</div>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Daily Meditation"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Category</div>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <Input
                  id="goal-description"
                  placeholder="Describe your goal..."
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Frequency</div>
                  <select
                    value={newGoal.frequency}
                    onChange={(e) => setNewGoal({ ...newGoal, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {frequencies.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequency}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Target (days)</div>
                  <Input
                    id="goal-target"
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={addGoal} className="flex-1">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setShowAddGoal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
