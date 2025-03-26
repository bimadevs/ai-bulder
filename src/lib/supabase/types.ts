export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      ai_projects: {
        Row: {
          id: string
          name: string
          description: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_configs: {
        Row: {
          id: string
          project_id: string
          config: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          config: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          config?: any
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          api_key: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
} 