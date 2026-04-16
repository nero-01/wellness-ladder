"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  const emotions = [
    "Happy",
    "Sad",
    "Anxious",
    "Calm",
    "Excited",
    "Frustrated",
    "Grateful",
    "Lonely",
    "Confident",
    "Overwhelmed",
    "Peaceful",
    "Angry",
  ]

  const moodLabels = [
    "Terrible",
    "Very Bad",
    "Bad",
    "Poor",
    "Okay",
    "Good",
    "Very Good",
    "Great",
    "Excellent",
    "Amazing",
  ]

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
            <p className="text-gray-600">How are you feeling right now?</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Rate Your Mood</CardTitle>
            <CardDescription>Select a number from 1-10</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>😢 Very Low</span>
                <span>😊 Very High</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={selectedMood}
                onChange={(e) => setSelectedMood(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-indigo-600">{selectedMood}/10</div>
                <div className="text-lg text-gray-700">{moodLabels[selectedMood - 1]}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>What emotions are you experiencing?</CardTitle>
            <CardDescription>Select all that apply</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-indigo-100"
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>What's on your mind? (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm font-medium">Your thoughts</div>
              <Textarea
                id="notes"
                placeholder="Describe what's contributing to your mood today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Mood Entry
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
