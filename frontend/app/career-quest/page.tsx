"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Target, Award, TrendingUp, Book, Briefcase, GraduationCap, Users } from "lucide-react"
import Link from "next/link"

export default function CareerQuestPage() {
  const { user } = useAuth()
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [nextLevelExp, setNextLevelExp] = useState(100)

  useEffect(() => {
    // In a real app, you'd fetch this data from an API
    setLevel(3)
    setExperience(275)
    setNextLevelExp(400)
  }, [])

  const progressPercentage = (experience / nextLevelExp) * 100

  const quests = [
    { icon: Book, title: "Complete Profile", exp: 50, completed: true },
    { icon: Briefcase, title: "Apply to 5 Jobs", exp: 100, completed: false },
    { icon: Users, title: "Attend Networking Event", exp: 75, completed: false },
    { icon: GraduationCap, title: "Complete Skills Assessment", exp: 150, completed: false },
  ]

  const achievements = [
    { icon: Trophy, title: "Profile Perfectionist", description: "Complete your profile 100%", unlocked: true },
    { icon: Star, title: "Job Seeker Extraordinaire", description: "Apply to 20 jobs", unlocked: false },
    { icon: Target, title: "Interview Ace", description: "Successfully complete 5 interviews", unlocked: false },
    { icon: Award, title: "Networking Guru", description: "Attend 3 career fairs", unlocked: true },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-vibrant-blue to-vibrant-purple bg-clip-text text-transparent">
        Career Quest
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Progress */}
        <Card className="md:col-span-1 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-blue to-vibrant-purple w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl">Level {level}</span>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {experience} / {nextLevelExp} XP to next level
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Career Stats:</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Jobs Applied</span>
                <Badge variant="secondary">15</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interviews Completed</span>
                <Badge variant="secondary">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Skills Mastered</span>
                <Badge variant="secondary">7</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quests */}
        <Card className="md:col-span-2 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-green to-vibrant-blue w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2 text-vibrant-green" />
              Active Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quests.map((quest, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <quest.icon className="w-8 h-8 mr-4 text-vibrant-blue" />
                    <div>
                      <h3 className="font-semibold">{quest.title}</h3>
                      <p className="text-sm text-muted-foreground">Reward: {quest.exp} XP</p>
                    </div>
                  </div>
                  {quest.completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Start Quest
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="md:col-span-3 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-orange to-vibrant-pink w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-6 h-6 mr-2 text-vibrant-orange" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${achievement.unlocked ? "bg-muted/50" : "bg-muted/20 opacity-50"}`}
                >
                  <achievement.icon
                    className={`w-8 h-8 mb-2 ${achievement.unlocked ? "text-vibrant-yellow" : "text-muted-foreground"}`}
                  />
                  <h3 className="font-semibold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked && (
                    <Badge variant="success" className="mt-2">
                      Unlocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Career Path */}
        <Card className="md:col-span-3 border-none shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-vibrant-purple to-vibrant-blue w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-vibrant-purple" />
              Your Career Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-blue/20 flex items-center justify-center mb-2">
                  <GraduationCap className="w-8 h-8 text-vibrant-blue" />
                </div>
                <p className="text-sm font-semibold">Student</p>
              </div>
              <div className="flex-1 h-1 bg-muted mx-4">
                <div className="h-full bg-vibrant-green" style={{ width: "30%" }}></div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-green/20 flex items-center justify-center mb-2">
                  <Briefcase className="w-8 h-8 text-vibrant-green" />
                </div>
                <p className="text-sm font-semibold">Intern</p>
              </div>
              <div className="flex-1 h-1 bg-muted mx-4"></div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-vibrant-orange/20 flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-vibrant-orange" />
                </div>
                <p className="text-sm font-semibold">Professional</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/jobs">
          <Button className="bg-gradient-to-r from-vibrant-blue to-vibrant-purple hover:from-vibrant-purple hover:to-vibrant-blue transition-all duration-300">
            Explore Job Opportunities
          </Button>
        </Link>
      </div>
    </div>
  )
}

