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
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, FileLineChartIcon as FlowChart, Trash2, Play, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow } from "@/app/actions/ai-actions" // Import the actions

interface AIWorkflowsListProps {
  workflows: any[]
  user: any
}

export function AIWorkflowsList({ workflows, user }: AIWorkflowsListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)
  const [executionInput, setExecutionInput] = useState("{}")
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    steps: "[]",
    trigger_type: "manual",
    trigger_config: "{}",
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      steps: "[]",
      trigger_type: "manual",
      trigger_config: "{}",
    })
  }

  const handleCreateWorkflow = async () => {
    setIsLoading(true)
    try {
      // Validate JSON
      try {
        JSON.parse(formData.steps)
        JSON.parse(formData.trigger_config)
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please ensure steps and trigger config are valid JSON",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await createWorkflow({
        ...formData,
        steps: JSON.parse(formData.steps),
        trigger_config: JSON.parse(formData.trigger_config),
        user_id: user.id,
        is_active: true,
      })

      if (result.success) {
        toast({
          title: "Workflow created",
          description: "Your AI workflow has been created successfully.",
        })
        setIsCreating(false)
        resetForm()
        // Refresh the page to get the updated list of workflows
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating workflow:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow)
    setFormData({
      name: workflow.name,
      description: workflow.description || "",
      steps: JSON.stringify(workflow.steps, null, 2),
      trigger_type: workflow.trigger_type || "manual",
      trigger_config: JSON.stringify(workflow.trigger_config || {}, null, 2),
    })
    setIsEditing(true)
  }

  const handleUpdateWorkflow = async () => {
    if (!selectedWorkflow) return

    setIsLoading(true)
    try {
      // Validate JSON
      try {
        JSON.parse(formData.steps)
        JSON.parse(formData.trigger_config)
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please ensure steps and trigger config are valid JSON",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await updateWorkflow({
        id: selectedWorkflow.id,
        ...formData,
        steps: JSON.parse(formData.steps),
        trigger_config: JSON.parse(formData.trigger_config),
        user_id: user.id,
      })

      if (result.success) {
        toast({
          title: "Workflow updated",
          description: "Your AI workflow has been updated successfully.",
        })
        setIsEditing(false)
        setSelectedWorkflow(null)
        resetForm()
        // Refresh the page to get the updated list of workflows
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating workflow:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    try {
      const result = await deleteWorkflow(workflowId)

      if (result.success) {
        toast({
          title: "Workflow deleted",
          description: "Your AI workflow has been deleted successfully.",
        })
        // Refresh the page to get the updated list of workflows
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting workflow:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExecuteWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow)
    setExecutionInput("{}")
    setExecutionResult(null)
    setIsExecuting(true)
  }

  const runWorkflow = async () => {
    if (!selectedWorkflow) return

    setIsLoading(true)
    try {
      // Validate JSON
      let inputData = {}
      try {
        inputData = JSON.parse(executionInput)
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please ensure input is valid JSON",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await executeWorkflow({
        workflowId: selectedWorkflow.id,
        input: inputData,
      })

      if (result.success) {
        setExecutionResult(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to execute workflow",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing workflow:", error)
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
        <h2 className="text-2xl font-bold">AI Workflows</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FlowChart className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Workflows Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any AI workflows yet. Create your first workflow to get started.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge variant="outline">
                    {workflow.trigger_type === "manual" ? "Manual" : workflow.trigger_type}
                  </Badge>
                </div>
                <CardDescription>{workflow.description || "No description provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Steps: {workflow.steps.length}</p>
                  <p>Status: {workflow.is_active ? "Active" : "Inactive"}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleExecuteWorkflow(workflow)}>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditWorkflow(workflow)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteWorkflow(workflow.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workflow Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create AI Workflow</DialogTitle>
            <DialogDescription>Create a new AI workflow to automate tasks and processes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Customer Data Analysis"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="E.g., Analyzes customer data and generates insights"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Type</label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => handleSelectChange("trigger_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Configuration (JSON)</label>
              <Textarea
                name="trigger_config"
                value={formData.trigger_config}
                onChange={handleInputChange}
                placeholder='{"schedule": "0 9 * * *"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Steps (JSON)</label>
              <Textarea
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                placeholder={`[
  {
    "id": "step1",
    "type": "agent",
    "name": "Data Analysis",
    "config": {
      "agent_id": "your-agent-id",
      "prompt": "Analyze the following data: {{input.data}}"
    },
    "next_steps": ["step2"]
  },
  {
    "id": "step2",
    "type": "code_generation",
    "name": "Generate Visualization Code",
    "config": {
      "language": "javascript",
      "description": "Generate code to visualize the analysis results"
    },
    "next_steps": []
  }
]`}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={isLoading || !formData.name || !formData.steps}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workflow"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit AI Workflow</DialogTitle>
            <DialogDescription>Update your AI workflow's settings and behavior.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Customer Data Analysis"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="E.g., Analyzes customer data and generates insights"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Type</label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => handleSelectChange("trigger_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trigger Configuration (JSON)</label>
              <Textarea
                name="trigger_config"
                value={formData.trigger_config}
                onChange={handleInputChange}
                placeholder='{"schedule": "0 9 * * *"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Steps (JSON)</label>
              <Textarea
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateWorkflow} disabled={isLoading || !formData.name || !formData.steps}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Workflow"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Workflow Dialog */}
      <Dialog open={isExecuting} onOpenChange={setIsExecuting}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Run AI Workflow: {selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>Execute your AI workflow with custom input data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Input Data (JSON)</label>
              <Textarea
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
                placeholder='{"data": "Sample data to analyze"}'
                className="min-h-[100px] font-mono text-sm"
              />
            </div>
            {executionResult && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow Results</label>
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(executionResult.results, null, 2)}
                  </pre>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Execution time: {(executionResult.execution_time / 1000).toFixed(2)}s | Status:{" "}
                  {executionResult.status}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuting(false)}>
              Close
            </Button>
            <Button onClick={runWorkflow} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "Run Workflow"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

