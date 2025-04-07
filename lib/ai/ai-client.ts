// Define the supported AI providers
export type AIProvider = "openai" | "anthropic" | "meta" | "mistral" | "google" | "stability" | "local"

// Define the common parameters for AI requests
export interface AIRequestParams {
  model: string
  messages: Array<{
    role: "system" | "user" | "assistant" | "function" | "tool"
    content:
      | string
      | Array<{
          type: "text" | "image_url"
          text?: string
          image_url?: {
            url: string
            detail?: "low" | "high" | "auto"
          }
        }>
    name?: string
    function_call?: {
      name: string
      arguments: string
    }
    tool_calls?: Array<{
      id: string
      type: "function"
      function: {
        name: string
        arguments: string
      }
    }>
    tool_call_id?: string
  }>
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
  tools?: Array<{
    type: "function"
    function: {
      name: string
      description: string
      parameters: Record<string, any>
    }
  }>
  tool_choice?:
    | "auto"
    | "none"
    | {
        type: "function"
        function: {
          name: string
        }
      }
  response_format?: {
    type: "json_object" | "text"
  }
}

// Define the common response structure
export interface AIResponse {
  id: string
  model: string
  created: number
  choices: Array<{
    index: number
    message: {
      role: "assistant" | "function" | "tool"
      content: string | null
      tool_calls?: Array<{
        id: string
        type: "function"
        function: {
          name: string
          arguments: string
        }
      }>
    }
    finish_reason: "stop" | "length" | "tool_calls" | "content_filter"
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Define the streaming response chunk
export interface AIStreamChunk {
  id: string
  model: string
  created: number
  choices: Array<{
    index: number
    delta: {
      role?: "assistant" | "function" | "tool"
      content?: string
      tool_calls?: Array<{
        index: number
        id?: string
        type?: "function"
        function?: {
          name?: string
          arguments?: string
        }
      }>
    }
    finish_reason: null | "stop" | "length" | "tool_calls" | "content_filter"
  }>
}

// Define the image generation parameters
export interface ImageGenerationParams {
  prompt: string
  model?: string
  n?: number
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"
  quality?: "standard" | "hd"
  style?: "vivid" | "natural"
  response_format?: "url" | "b64_json"
}

// Define the image generation response
export interface ImageGenerationResponse {
  created: number
  data: Array<{
    url?: string
    b64_json?: string
    revised_prompt?: string
  }>
}

// Define the embedding parameters
export interface EmbeddingParams {
  model: string
  input: string | string[]
  encoding_format?: "float" | "base64"
  dimensions?: number
  user?: string
}

// Define the embedding response
export interface EmbeddingResponse {
  data: Array<{
    embedding: number[]
    index: number
    object: string
  }>
  model: string
  object: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

// Main AI client class
export class AIClient {
  private apiKey: string
  private provider: AIProvider
  private baseUrl: string
  private defaultModel: string

  constructor(provider: AIProvider, apiKey: string, defaultModel?: string) {
    this.provider = provider
    this.apiKey = apiKey

    // Set the base URL based on the provider
    switch (provider) {
      case "openai":
        this.baseUrl = "https://api.openai.com/v1"
        this.defaultModel = defaultModel || "gpt-4o"
        break
      case "anthropic":
        this.baseUrl = "https://api.anthropic.com/v1"
        this.defaultModel = defaultModel || "claude-3-opus-20240229"
        break
      case "mistral":
        this.baseUrl = "https://api.mistral.ai/v1"
        this.defaultModel = defaultModel || "mistral-large-latest"
        break
      case "google":
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta"
        this.defaultModel = defaultModel || "gemini-1.5-pro"
        break
      case "meta":
        this.baseUrl = "https://llama-api.meta.com/v1"
        this.defaultModel = defaultModel || "meta/llama-3-70b-instruct"
        break
      case "stability":
        this.baseUrl = "https://api.stability.ai/v1"
        this.defaultModel = defaultModel || "stable-diffusion-xl"
        break
      case "local":
        this.baseUrl = "http://localhost:8000"
        this.defaultModel = defaultModel || "local-model"
        break
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  // Method to create chat completions
  async createChatCompletion(params: AIRequestParams): Promise<AIResponse> {
    const model = params.model || this.defaultModel
    const endpoint = this.getChatCompletionEndpoint()

    const requestBody = this.formatChatCompletionRequest(params)

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`)
    }

    return this.formatChatCompletionResponse(await response.json())
  }

  // Method to create streaming chat completions
  async createStreamingChatCompletion(params: AIRequestParams, onChunk: (chunk: AIStreamChunk) => void): Promise<void> {
    const model = params.model || this.defaultModel
    const endpoint = this.getChatCompletionEndpoint()

    const requestBody = this.formatChatCompletionRequest({
      ...params,
      stream: true,
    })

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`)
    }

    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "" && line.trim() !== "data: [DONE]")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              onChunk(this.formatStreamChunk(data))
            } catch (e) {
              console.error("Error parsing stream chunk:", e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  // Method to generate images
  async generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    const endpoint = this.getImageGenerationEndpoint()
    const requestBody = this.formatImageGenerationRequest(params)

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`)
    }

    return this.formatImageGenerationResponse(await response.json())
  }

  // Method to create embeddings
  async createEmbedding(params: EmbeddingParams): Promise<EmbeddingResponse> {
    const endpoint = this.getEmbeddingEndpoint()
    const requestBody = this.formatEmbeddingRequest(params)

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI API Error: ${error.error?.message || response.statusText}`)
    }

    return this.formatEmbeddingResponse(await response.json())
  }

  // Helper methods for endpoint determination
  private getChatCompletionEndpoint(): string {
    switch (this.provider) {
      case "openai":
        return "/chat/completions"
      case "anthropic":
        return "/messages"
      case "mistral":
        return "/chat/completions"
      case "google":
        return "/models/gemini-1.5-pro:generateContent"
      case "meta":
        return "/chat/completions"
      case "local":
        return "/v1/chat/completions"
      default:
        throw new Error(`Unsupported provider for chat completion: ${this.provider}`)
    }
  }

  private getImageGenerationEndpoint(): string {
    switch (this.provider) {
      case "openai":
        return "/images/generations"
      case "stability":
        return "/generation/stable-diffusion-xl/text-to-image"
      default:
        throw new Error(`Unsupported provider for image generation: ${this.provider}`)
    }
  }

  private getEmbeddingEndpoint(): string {
    switch (this.provider) {
      case "openai":
        return "/embeddings"
      case "mistral":
        return "/embeddings"
      case "local":
        return "/v1/embeddings"
      default:
        throw new Error(`Unsupported provider for embeddings: ${this.provider}`)
    }
  }

  // Helper methods for request formatting
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    switch (this.provider) {
      case "openai":
        headers["Authorization"] = `Bearer ${this.apiKey}`
        break
      case "anthropic":
        headers["x-api-key"] = this.apiKey
        headers["anthropic-version"] = "2023-06-01"
        break
      case "mistral":
        headers["Authorization"] = `Bearer ${this.apiKey}`
        break
      case "google":
        headers["x-goog-api-key"] = this.apiKey
        break
      case "meta":
        headers["Authorization"] = `Bearer ${this.apiKey}`
        break
      case "stability":
        headers["Authorization"] = `Bearer ${this.apiKey}`
        break
      case "local":
        // No auth headers needed for local
        break
    }

    return headers
  }

  private formatChatCompletionRequest(params: AIRequestParams): any {
    switch (this.provider) {
      case "openai":
        return {
          model: params.model || this.defaultModel,
          messages: params.messages,
          temperature: params.temperature,
          top_p: params.top_p,
          max_tokens: params.max_tokens,
          stream: params.stream,
          tools: params.tools,
          tool_choice: params.tool_choice,
          response_format: params.response_format,
        }
      case "anthropic":
        return {
          model: params.model || this.defaultModel,
          messages: params.messages,
          temperature: params.temperature,
          top_p: params.top_p,
          max_tokens: params.max_tokens,
          stream: params.stream,
        }
      case "mistral":
        return {
          model: params.model || this.defaultModel,
          messages: params.messages,
          temperature: params.temperature,
          top_p: params.top_p,
          max_tokens: params.max_tokens,
          stream: params.stream,
          tools: params.tools,
          tool_choice: params.tool_choice,
        }
      case "google":
        return {
          contents: params.messages.map((msg) => ({
            role: msg.role === "user" ? "USER" : msg.role === "assistant" ? "MODEL" : "SYSTEM",
            parts: Array.isArray(msg.content)
              ? msg.content.map((part) => ({
                  text: part.type === "text" ? part.text : undefined,
                  inline_data:
                    part.type === "image_url"
                      ? {
                          mime_type: "image/jpeg",
                          data: part.image_url?.url,
                        }
                      : undefined,
                }))
              : [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: params.temperature,
            topP: params.top_p,
            maxOutputTokens: params.max_tokens,
          },
        }
      case "meta":
        return {
          model: params.model || this.defaultModel,
          messages: params.messages,
          temperature: params.temperature,
          top_p: params.top_p,
          max_tokens: params.max_tokens,
          stream: params.stream,
        }
      case "local":
        return {
          model: params.model || this.defaultModel,
          messages: params.messages,
          temperature: params.temperature,
          top_p: params.top_p,
          max_tokens: params.max_tokens,
          stream: params.stream,
          tools: params.tools,
          tool_choice: params.tool_choice,
        }
      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  private formatImageGenerationRequest(params: ImageGenerationParams): any {
    switch (this.provider) {
      case "openai":
        return {
          model: params.model || "dall-e-3",
          prompt: params.prompt,
          n: params.n || 1,
          size: params.size || "1024x1024",
          quality: params.quality || "standard",
          style: params.style || "vivid",
          response_format: params.response_format || "url",
        }
      case "stability":
        return {
          text_prompts: [
            {
              text: params.prompt,
              weight: 1.0,
            },
          ],
          cfg_scale: 7.0,
          height: Number.parseInt(params.size?.split("x")[1] || "1024"),
          width: Number.parseInt(params.size?.split("x")[0] || "1024"),
          samples: params.n || 1,
          steps: 30,
        }
      default:
        throw new Error(`Unsupported provider for image generation: ${this.provider}`)
    }
  }

  private formatEmbeddingRequest(params: EmbeddingParams): any {
    switch (this.provider) {
      case "openai":
        return {
          model: params.model,
          input: params.input,
          encoding_format: params.encoding_format || "float",
          dimensions: params.dimensions,
          user: params.user,
        }
      case "mistral":
        return {
          model: params.model,
          input: params.input,
          encoding_format: params.encoding_format || "float",
        }
      case "local":
        return {
          model: params.model,
          input: params.input,
          encoding_format: params.encoding_format || "float",
          dimensions: params.dimensions,
        }
      default:
        throw new Error(`Unsupported provider for embeddings: ${this.provider}`)
    }
  }

  // Helper methods for response formatting
  private formatChatCompletionResponse(response: any): AIResponse {
    switch (this.provider) {
      case "openai":
        return response
      case "anthropic":
        return {
          id: response.id,
          model: response.model,
          created: Math.floor(Date.now() / 1000),
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: response.content[0].text,
              },
              finish_reason: response.stop_reason === "end_turn" ? "stop" : response.stop_reason,
            },
          ],
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        }
      case "mistral":
        return response
      case "google":
        return {
          id: response.name || `gemini-${Date.now()}`,
          model: response.model || this.defaultModel,
          created: Math.floor(Date.now() / 1000),
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: response.candidates[0].content.parts[0].text,
              },
              finish_reason: response.candidates[0].finishReason === "STOP" ? "stop" : "length",
            },
          ],
          usage: {
            prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
            completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
            total_tokens:
              (response.usageMetadata?.promptTokenCount || 0) + (response.usageMetadata?.candidatesTokenCount || 0),
          },
        }
      case "meta":
        return response
      case "local":
        return response
      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  private formatStreamChunk(chunk: any): AIStreamChunk {
    switch (this.provider) {
      case "openai":
        return chunk
      case "anthropic":
        return {
          id: chunk.id,
          model: chunk.model,
          created: Math.floor(Date.now() / 1000),
          choices: [
            {
              index: 0,
              delta: {
                role: chunk.type === "message_start" ? "assistant" : undefined,
                content: chunk.type === "content_block_delta" ? chunk.delta.text : undefined,
              },
              finish_reason: chunk.type === "message_stop" ? "stop" : null,
            },
          ],
        }
      case "mistral":
        return chunk
      case "meta":
        return chunk
      case "local":
        return chunk
      default:
        throw new Error(`Unsupported provider for streaming: ${this.provider}`)
    }
  }

  private formatImageGenerationResponse(response: any): ImageGenerationResponse {
    switch (this.provider) {
      case "openai":
        return response
      case "stability":
        return {
          created: Math.floor(Date.now() / 1000),
          data: response.artifacts.map((artifact: any) => ({
            url: artifact.base64 ? `data:image/png;base64,${artifact.base64}` : undefined,
            b64_json: artifact.base64,
            revised_prompt: artifact.finishReason === "SUCCESS" ? undefined : "Error generating image",
          })),
        }
      default:
        throw new Error(`Unsupported provider for image generation: ${this.provider}`)
    }
  }

  private formatEmbeddingResponse(response: any): EmbeddingResponse {
    switch (this.provider) {
      case "openai":
        return response
      case "mistral":
        return response
      case "local":
        return response
      default:
        throw new Error(`Unsupported provider for embeddings: ${this.provider}`)
    }
  }
}

