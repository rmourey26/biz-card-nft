export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          user_id: string | null
          full_name: string | null
          username: string | null
          email: string | null
          company: string | null
          job_title: string | null
          website: string | null
          linkedin_url: string | null
          avatar_url: string | null
          company_logo_url: string | null
          waddress: string | null
          xhandle: string | null
          created_at: string | null
          public_id: string | null
          public_access: boolean | null
          card_style: {
            backgroundColor: string
            textColor: string
            primaryColor: string
          } | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          user_id?: string | null
          full_name?: string | null
          username?: string | null
          email?: string | null
          company?: string | null
          job_title?: string | null
          website?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          waddress?: string | null
          xhandle?: string | null
          created_at?: string | null
          public_id?: string | null
          public_access?: boolean | null
          card_style?: {
            backgroundColor: string
            textColor: string
            primaryColor: string
          } | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          user_id?: string | null
          full_name?: string | null
          username?: string | null
          email?: string | null
          company?: string | null
          job_title?: string | null
          website?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
          company_logo_url?: string | null
          waddress?: string | null
          xhandle?: string | null
          created_at?: string | null
          public_id?: string | null
          public_access?: boolean | null
          card_style?: {
            backgroundColor: string
            textColor: string
            primaryColor: string
          } | null
        }
      }
      nfts: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          name: string
          tx_hash: string
          token_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          name: string
          tx_hash: string
          token_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          name?: string
          tx_hash?: string
          token_id?: string
          created_at?: string
        }
      }
      sui_nfts: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          name: string
          object_id: string
          tx_digest: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          name: string
          object_id: string
          tx_digest: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          name?: string
          object_id?: string
          tx_digest?: string
          image_url?: string | null
          created_at?: string
        }
      }
      crm_connections: {
        Row: {
          id: string
          user_id: string
          provider: string
          name: string
          api_key: string | null
          refresh_token: string | null
          access_token: string | null
          instance_url: string | null
          expires_at: string | null
          last_sync_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          name: string
          api_key?: string | null
          refresh_token?: string | null
          access_token?: string | null
          instance_url?: string | null
          expires_at?: string | null
          last_sync_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          name?: string
          api_key?: string | null
          refresh_token?: string | null
          access_token?: string | null
          instance_url?: string | null
          expires_at?: string | null
          last_sync_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      crm_contacts: {
        Row: {
          id: string
          connection_id: string
          user_id: string
          external_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          job_title: string | null
          address: string | null
          last_contacted: string | null
          status: string | null
          tags: string[] | null
          custom_fields: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          user_id: string
          external_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          job_title?: string | null
          address?: string | null
          last_contacted?: string | null
          status?: string | null
          tags?: string[] | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          user_id?: string
          external_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          job_title?: string | null
          address?: string | null
          last_contacted?: string | null
          status?: string | null
          tags?: string[] | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      crm_deals: {
        Row: {
          id: string
          connection_id: string
          user_id: string
          external_id: string
          name: string
          stage: string | null
          amount: number | null
          currency: string | null
          close_date: string | null
          probability: number | null
          contact_id: string | null
          description: string | null
          custom_fields: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          user_id: string
          external_id: string
          name: string
          stage?: string | null
          amount?: number | null
          currency?: string | null
          close_date?: string | null
          probability?: number | null
          contact_id?: string | null
          description?: string | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          user_id?: string
          external_id?: string
          name?: string
          stage?: string | null
          amount?: number | null
          currency?: string | null
          close_date?: string | null
          probability?: number | null
          contact_id?: string | null
          description?: string | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      crm_activities: {
        Row: {
          id: string
          connection_id: string
          user_id: string
          external_id: string
          type: string
          subject: string
          description: string | null
          status: string | null
          priority: string | null
          due_date: string | null
          completed_date: string | null
          contact_id: string | null
          deal_id: string | null
          custom_fields: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          user_id: string
          external_id: string
          type: string
          subject: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_date?: string | null
          contact_id?: string | null
          deal_id?: string | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          connection_id?: string
          user_id?: string
          external_id?: string
          type?: string
          subject?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          due_date?: string | null
          completed_date?: string | null
          contact_id?: string | null
          deal_id?: string | null
          custom_fields?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

