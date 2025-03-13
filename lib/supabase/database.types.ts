export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
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
          updated_at: string
        }
        Insert: {
          id: string
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
          updated_at?: string
        }
        Update: {
          id?: string
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
          updated_at?: string
        }
      }
      // Other tables remain the same
    }
  }
}

