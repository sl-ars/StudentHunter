"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Award, TrendingUp } from "lucide-react"
import type { GamificationProgress } from "@/lib/types"

interface GamificationDashboardProps {
  progress: GamificationProgress
}

export function GamificationDashboard({ progress }: GamificationDashboardProps) {
  const percentToNextLevel = (progress.currentPoints / progress.pointsToNextLevel) * 100

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Level {progress.level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{progress.currentPoints} XP</span>
              <span>{progress.pointsToNextLevel} XP</span>
            </div>
            <Progress value={percentToNextLevel} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress.pointsToNextLevel - progress.currentPoints} XP to next level
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-vibrant-blue" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activity.type === "application" && <Target className="h-4 w-4 text-vibrant-green" />}
                  {activity.type === "profile" && <Star className="h-4 w-4 text-vibrant-orange" />}
                  {activity.type === "interview" && <Award className="h-4 w-4 text-vibrant-purple" />}
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-vibrant-green">+{activity.points} XP</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-vibrant-purple" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {progress.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-start gap-4 rounded-lg border p-4 ${
                  achievement.unlockedAt ? "bg-primary/5" : "opacity-50"
                }`}
              >
                <div className="rounded-full bg-primary/10 p-2">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="mt-1 text-xs text-vibrant-green">
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

