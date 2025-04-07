"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AIModel {
  id: string
  name: string
  description: string
  provider: string
  cost_per_1k_tokens?: number
}

interface AIModelsListProps {
  models: AIModel[]
}

export function AIModelsList({ models }: AIModelsListProps) {
  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card key={model.id}>
          <CardHeader>
            <CardTitle>{model.name}</CardTitle>
            <CardDescription>{model.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className="bg-muted text-muted-foreground">{model.provider}</Badge>
              <p className="text-sm text-muted-foreground">Cost: ${model.cost_per_1k_tokens?.toFixed(3)} / 1k tokens</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

