export interface AIModel {
  id: string
  name: string
  provider: string
  model_id: string
  description: string | null
  capabilities: string[]
  parameters: Record<string, any>
  cost_per_1k_tokens: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIAgent {
  id: string
  name: string
  description: string | null
  system_prompt: string | null
  model_id: string
  user_id: string
  parameters: Record<string, any>
  tools: any[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DataEmbedding {
  id: string
  name: string
  description: string | null
  source_type: string
  source_id: string | null
  embedding_model: string
  vector_data: number[]
  metadata: Record<string, any>
  user_id: string
  created_at: string
  updated_at: string
}

export interface SupplyChainData {
  id: string
  name: string
  description: string | null
  data_type: string
  data: Record<string, any>
  metadata: Record<string, any>
  user_id: string
  created_at: string
  updated_at: string
}

export interface ReusablePackage {
  id: string
  package_id: string
  name: string
  description: string | null
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  weight_capacity: number
  material: string | null
  reuse_count: number
  status: "available" | "in_use" | "damaged" | "retired"
  location_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Shipping {
  id: string
  tracking_number: string
  origin_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  destination_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  package_ids: string[]
  carrier: string | null
  shipping_date: string | null
  estimated_delivery: string | null
  actual_delivery: string | null
  status: "pending" | "in_transit" | "delivered" | "delayed" | "cancelled"
  cost: number | null
  weight: number | null
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  } | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AIAnalysisResult {
  id: string
  analysis_type: string
  source_type: string
  source_id: string
  agent_id: string | null
  results: Record<string, any>
  metadata: Record<string, any>
  user_id: string
  created_at: string
  updated_at: string
}

export interface AIWorkflow {
  id: string
  name: string
  description: string | null
  steps: any[]
  trigger_type: string | null
  trigger_config: Record<string, any>
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface AIWorkflowRun {
  id: string
  workflow_id: string
  status: "pending" | "running" | "completed" | "failed"
  start_time: string
  end_time: string | null
  results: Record<string, any>
  error: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface DeveloperTool {
  id: string
  name: string
  tool_type: string
  configuration: Record<string, any>
  description: string | null
  is_active: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface ShippingAnalytics {
  shipping_day: string
  total_shipments: number
  avg_estimated_delivery_days: number
  avg_actual_delivery_days: number
  total_cost: number
  avg_cost: number
  total_weight: number
  avg_weight: number
  delivered_count: number
  in_transit_count: number
  delayed_count: number
}

export interface PackageUtilization {
  id: string
  package_id: string
  name: string
  reuse_count: number
  status: string
  shipment_count: number
  last_used_date: string | null
  created_at: string
  days_since_creation: number
  reuses_per_day: number
}

