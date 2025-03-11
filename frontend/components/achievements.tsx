"use client"

import { Trophy, User, Send, Video, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Achievement } from "@/lib/types"

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "Profile Perfectionist",
    description: "Complete your profile to 100%",
    points: 100,
    icon: "user",
  },
  {
    id: "2",
    title: "Application Master",
    description: "Submit 10 job applications",
    points: 200,
    icon: "send",
  },
  {
    id: "3",
    title: "Interview Ready",
    description: "Complete 5 mock interviews",
    points: 300,
    icon: "video",
  },
  {
    id: "4",
    title: "Networking Pro",
    description: "Connect with 20 employers",
    points: 400,
    icon: "users",
  },
]

export function AchievementsCard({ userAchievements }: { userAchievements: Achievement[] }) {
  const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0)
  const level = Math.floor(totalPoints / 1000) + 1
  const progress = (totalPoints % 1000) / 10 // Convert to percentage

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">{totalPoints} points</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
        <div className="grid gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = userAchievements.some((a) => a.id === achievement.id)
            return (
              <div
                key={achievement.id}
                className={`flex items-start gap-4 rounded-lg border p-4 ${isUnlocked ? "bg-primary/5" : "opacity-50"}`}
              >
                <div className="rounded-full bg-primary/10 p-2">
                  {achievement.icon === "user" && <User className="h-4 w-4 text-primary" />}
                  {achievement.icon === "send" && <Send className="h-4 w-4 text-primary" />}
                  {achievement.icon === "video" && <Video className="h-4 w-4 text-primary" />}
                  {achievement.icon === "users" && <Users className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">{achievement.points} pts</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

