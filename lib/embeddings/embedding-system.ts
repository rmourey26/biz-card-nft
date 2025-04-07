import { AIClient } from "../ai/ai-client"
import { createClient } from "@supabase/supabase-js"
import type { DataEmbedding } from "../types/database"

// Define the document interface
export interface Document {
  id: string
  content: string
  metadata?: Record<string, any>
}

// Define the embedding result interface
export interface EmbeddingResult {
  id: string
  embedding: number[]
  metadata: Record<string, any>
}

// Define the search result interface
export interface SearchResult {
  id: string
  content: string
  metadata: Record<string, any>
  similarity: number
}

// Embedding system class
export class EmbeddingSystem {
  private supabase: any
  private aiClient: AIClient
  private embeddingModel: string
  private embeddingDimensions: number

  constructor(supabaseUrl: string, supabaseKey: string, embeddingModel = "text-embedding-ada-002", dimensions = 1536) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.aiClient = new AIClient("openai", process.env.OPENAI_API_KEY || "", embeddingModel)
    this.embeddingModel = embeddingModel
    this.embeddingDimensions = dimensions
  }

  // Create embeddings for documents
  async createEmbeddings(
    documents: Document[],
    userId: string,
    name: string,
    description?: string,
  ): Promise<EmbeddingResult[]> {
    // Create embeddings for each document
    const embeddings: EmbeddingResult[] = []

    for (const document of documents) {
      // Generate embedding
      const embeddingResponse = await this.aiClient.createEmbedding({
        model: this.embeddingModel,
        input: document.content,
      })

      const embedding = embeddingResponse.data[0].embedding

      // Store the embedding in the database
      const { data, error } = await this.supabase
        .from("data_embeddings")
        .insert({
          name,
          description,
          source_type: "document",
          source_id: document.id,
          embedding_model: this.embeddingModel,
          vector_data: embedding,
          metadata: {
            ...document.metadata,
            content: document.content,
          },
          user_id: userId,
        })
        .select()

      if (error) {
        console.error("Error storing embedding:", error)
        throw error
      }

      embeddings.push({
        id: data[0].id,
        embedding,
        metadata: {
          ...document.metadata,
          content: document.content,
        },
      })
    }

    return embeddings
  }

  // Search for similar documents
  async searchSimilarDocuments(query: string, userId: string, limit = 5, threshold = 0.7): Promise<SearchResult[]> {
    // Generate embedding for the query
    const embeddingResponse = await this.aiClient.createEmbedding({
      model: this.embeddingModel,
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search for similar documents in the database
    const { data, error } = await this.supabase.rpc("match_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      user_id: userId,
    })

    if (error) {
      console.error("Error searching for similar documents:", error)
      throw error
    }

    // Format the results
    const results: SearchResult[] = data.map((item: any) => ({
      id: item.id,
      content: item.metadata.content,
      metadata: item.metadata,
      similarity: item.similarity,
    }))

    return results
  }

  // Create embeddings for supply chain data
  async createSupplyChainEmbeddings(
    data: any[],
    dataType: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<EmbeddingResult[]> {
    // Convert data to documents
    const documents = data.map((item) => ({
      id: item.id,
      content: this.formatSupplyChainData(item, dataType),
      metadata: {
        data_type: dataType,
        original_data: item,
      },
    }))

    // Create embeddings
    return this.createEmbeddings(documents, userId, name, description)
  }

  // Format supply chain data for embedding
  private formatSupplyChainData(data: any, dataType: string): string {
    switch (dataType) {
      case "reusable_packages":
        return `Package ID: ${data.package_id}
Name: ${data.name}
Description: ${data.description || "N/A"}
Dimensions: ${data.dimensions.length}x${data.dimensions.width}x${data.dimensions.height} ${data.dimensions.unit}
Weight Capacity: ${data.weight_capacity}
Material: ${data.material || "N/A"}
Reuse Count: ${data.reuse_count}
Status: ${data.status}
Location: ${data.location_id || "N/A"}`

      case "shipping":
        return `Tracking Number: ${data.tracking_number}
Origin: ${data.origin_address.street}, ${data.origin_address.city}, ${data.origin_address.state}, ${data.origin_address.postal_code}, ${data.origin_address.country}
Destination: ${data.destination_address.street}, ${data.destination_address.city}, ${data.destination_address.state}, ${data.destination_address.postal_code}, ${data.destination_address.country}
Carrier: ${data.carrier || "N/A"}
Status: ${data.status}
Shipping Date: ${data.shipping_date || "N/A"}
Estimated Delivery: ${data.estimated_delivery || "N/A"}
Actual Delivery: ${data.actual_delivery || "N/A"}
Cost: ${data.cost || "N/A"}
Weight: ${data.weight || "N/A"}
Dimensions: ${data.dimensions ? `${data.dimensions.length}x${data.dimensions.width}x${data.dimensions.height} ${data.dimensions.unit}` : "N/A"}`

      default:
        return JSON.stringify(data)
    }
  }

  // Get all embeddings for a user
  async getUserEmbeddings(userId: string): Promise<DataEmbedding[]> {
    const { data, error } = await this.supabase.from("data_embeddings").select("*").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user embeddings:", error)
      throw error
    }

    return data
  }

  // Delete an embedding
  async deleteEmbedding(embeddingId: string, userId: string): Promise<void> {
    const { error } = await this.supabase.from("data_embeddings").delete().eq("id", embeddingId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting embedding:", error)
      throw error
    }
  }

  // Update an embedding
  async updateEmbedding(
    embeddingId: string,
    userId: string,
    updates: { name?: string; description?: string; metadata?: Record<string, any> },
  ): Promise<DataEmbedding> {
    const { data, error } = await this.supabase
      .from("data_embeddings")
      .update(updates)
      .eq("id", embeddingId)
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Error updating embedding:", error)
      throw error
    }

    return data[0]
  }
}

