"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Bot, Trash2, Play, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createAgent, updateAgent, deleteAgent, executeAgent } from "@/app/actions/ai-actions" // Import the actions
import type { AIModel } from "@/lib/types/database"

interface AIAgentsListProps {
  agents: any[]
  user: any
  aiModels: AIModel[]
}

export function AIAgentsList({ agents, user, aiModels }: AIAgentsListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [executionPrompt, setExecutionPrompt] = useState("")
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    system_prompt: "",
    model_id: aiModels[0]?.id || "",
    temperature: 0.7,
    max_tokens: 1000,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_prompt: "",
      model_id: aiModels[0]?.id || "",
      temperature: 0.7,
      max_tokens: 1000,
    })
  }

  const handleCreateAgent = async () => {
    setIsLoading(true)
    try {
      const result = await createAgent({
        ...formData,
        user_id: user.id,
      })

      if (result.success) {
        toast({
          title: "Agent created",
          description: "Your AI agent has been created successfully.",
        })
        setIsCreating(false)
        resetForm()
        // Refresh the page to get the updated list of agents
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description || "",
      system_prompt: agent.system_prompt || "",
      model_id: agent.model_id,
      temperature: agent.parameters?.temperature || 0.7,
      max_tokens: agent.parameters?.max_tokens || 1000,
    })
    setIsEditing(true)
  }

  const handleUpdateAgent = async () => {
    if (!selectedAgent) return

    setIsLoading(true)
    try {
      const result = await updateAgent({
        id: selectedAgent.id,
        ...formData,
        user_id: user.id,
      })

      if (result.success) {
        toast({
          title: "Agent updated",
          description: "Your AI agent has been updated successfully.",
        })
        setIsEditing(false)
        setSelectedAgent(null)
        resetForm()
        // Refresh the page to get the updated list of agents
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      const result = await deleteAgent(agentId)

      if (result.success) {
        toast({
          title: "Agent deleted",
          description: "Your AI agent has been deleted successfully.",
        })
        // Refresh the page to get the updated list of agents
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExecuteAgent = (agent: any) => {
    setSelectedAgent(agent)
    setExecutionPrompt("")
    setExecutionResult(null)
    setIsExecuting(true)
  }

  const runAgent = async () => {
    if (!selectedAgent || !executionPrompt.trim()) return

    setIsLoading(true)
    try {
      const result = await executeAgent({
        agentId: selectedAgent.id,
        prompt: executionPrompt,
      })

      if (result.success) {
        setExecutionResult(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to execute agent",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing agent:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Agents</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Bot className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Agents Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any AI agents yet. Create your first agent to get started.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <Badge variant="outline">
                    {aiModels.find((model) => model.id === agent.model_id)?.name || "Unknown Model"}
                  </Badge>
                </div>
                <CardDescription>{agent.description || "No description provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {agent.system_prompt || "No system prompt provided"}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleExecuteAgent(agent)}>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditAgent(agent)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteAgent(agent.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Agent Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create AI Agent</DialogTitle>
            <DialogDescription>Create a new AI agent with a specific purpose and personality.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Customer Support Agent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="E.g., An agent that helps with customer inquiries"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleInputChange}
                placeholder="E.g., You are a helpful customer support agent for our company. You should be polite, informative, and concise."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={formData.model_id} onValueChange={(value) => handleSelectChange("model_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Temperature: {formData.temperature}</label>
              </div>
              <Slider
                value={[formData.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => handleSliderChange("temperature", value)}
              />
              <p className="text-xs text-muted-foreground">
                Lower values produce more predictable responses, higher values produce more creative ones.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Max Tokens: {formData.max_tokens}</label>
              </div>
              <Slider
                value={[formData.max_tokens]}
                min={100}
                max={4000}
                step={100}
                onValueChange={(value) => handleSliderChange("max_tokens", value)}
              />
              <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in the response.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAgent} disabled={isLoading || !formData.name || !formData.system_prompt}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit AI Agent</DialogTitle>
            <DialogDescription>Update your AI agent's settings and behavior.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Customer Support Agent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="E.g., An agent that helps with customer inquiries"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">System Prompt</label>
              <Textarea
                name="system_prompt"
                value={formData.system_prompt}
                onChange={handleInputChange}
                placeholder="E.g., You are a helpful customer support agent for our company. You should be polite, informative, and concise."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Model</label>
              <Select value={formData.model_id} onValueChange={(value) => handleSelectChange("model_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Temperature: {formData.temperature}</label>
              </div>
              <Slider
                value={[formData.temperature]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(value) => handleSliderChange("temperature", value)}
              />
              <p className="text-xs text-muted-foreground">
                Lower values produce more predictable responses, higher values produce more creative ones.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Max Tokens: {formData.max_tokens}</label>
              </div>
              <Slider
                value={[formData.max_tokens]}
                min={100}
                max={4000}
                step={100}
                onValueChange={(value) => handleSliderChange("max_tokens", value)}
              />
              <p className="text-xs text-muted-foreground">Maximum number of tokens to generate in the response.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent} disabled={isLoading || !formData.name || !formData.system_prompt}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Agent Dialog */}
      <Dialog open={isExecuting} onOpenChange={setIsExecuting}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Run AI Agent: {selectedAgent?.name}</DialogTitle>
            <DialogDescription>Interact with your AI agent by providing a prompt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prompt</label>
              <Textarea
                value={executionPrompt}
                onChange={(e) => setExecutionPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[100px]"
              />
            </div>
            {executionResult && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Response</label>
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                  <p className="whitespace-pre-wrap">{executionResult.finalResponse}</p>
                </div>
                {executionResult.toolCalls.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium">Tools Used</label>
                    <div className="bg-muted p-4 rounded-md overflow-auto max-h-[200px] mt-2">
                      <ul className="space-y-2">
                        {executionResult.toolCalls.map((toolCall: any, index: number) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{toolCall.tool}:</span>{" "}
                            <code className="text-xs">{JSON.stringify(toolCall.params)}</code>
                            <div className="mt-1 text-xs">
                              Result: <code>{JSON.stringify(toolCall.result)}</code>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  Execution time: {(executionResult.elapsedMs / 1000).toFixed(2)}s | Tokens used:{" "}
                  {executionResult.tokens.total}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuting(false)}>
              Close
            </Button>
            <Button onClick={runAgent} disabled={isLoading || !executionPrompt.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Agent"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

