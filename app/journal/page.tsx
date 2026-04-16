"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Plus } from "lucide-react"
import Link from "next/link"

export default function Journal() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const recentEntries = [
    {
      title: "Feeling grateful today",
      date: "Today, 2:30 PM",
      preview: "Had a wonderful conversation with my friend...",
      tags: ["gratitude", "friendship"],
    },
    {
      title: "Anxiety about work presentation",
      date: "Yesterday, 8:45 PM",
      preview: "Tomorrow I have to present to the team...",
      tags: ["anxiety", "work"],
    },
    {
      title: "Morning meditation reflection",
      date: "Yesterday, 7:00 AM",
      preview: "Today's meditation helped me feel centered...",
      tags: ["meditation", "mindfulness"],
    },
  ]

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thought Journal</h1>
            <p className="text-gray-600">Express your thoughts and feelings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Entry */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
                <CardDescription>Write about your thoughts and feelings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Title</div>
                  <Input
                    id="title"
                    placeholder="Give your entry a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Your thoughts</div>
                  <Textarea
                    id="content"
                    placeholder="What's on your mind? How are you feeling? What happened today?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Tags</div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="flex-1"
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                  <Button variant="outline">Clear</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your latest thoughts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{entry.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{entry.date}</p>
                      <p className="text-sm text-gray-700 mb-2">{entry.preview}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Writing Prompts</CardTitle>
                <CardDescription>Need inspiration?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full text-left justify-start text-sm h-auto p-2">
                    What made you smile today?
                  </Button>
                  <Button variant="ghost" className="w-full text-left justify-start text-sm h-auto p-2">
                    Describe a challenge you overcame
                  </Button>
                  <Button variant="ghost" className="w-full text-left justify-start text-sm h-auto p-2">
                    What are you grateful for?
                  </Button>
                  <Button variant="ghost" className="w-full text-left justify-start text-sm h-auto p-2">
                    How did you practice self-care?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
