export type Database = {
  __InternalSupabase: {
    PostgrestVersion: string
  }
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string
          discount_rate: number
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          domain: string
          discount_rate?: number
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          discount_rate?: number
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          organization_id: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          organization_id?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          total_amount: number | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          total_amount?: number | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          total_amount?: number | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category: string
          subcategory: string | null
          tag: string | null
          name: string
          description: string | null
          price: number | null
          image_url: string | null
          hover_image_url: string | null
          sort_order: number
          purchasable: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          subcategory?: string | null
          tag?: string | null
          name: string
          description?: string | null
          price?: number | null
          image_url?: string | null
          hover_image_url?: string | null
          sort_order?: number
          purchasable?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          subcategory?: string | null
          tag?: string | null
          name?: string
          description?: string | null
          price?: number | null
          image_url?: string | null
          hover_image_url?: string | null
          sort_order?: number
          purchasable?: boolean
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      coffee_pricing: {
        Row: {
          subcategory: string
          base_price: number
          discount_percent: number
        }
        Insert: {
          subcategory: string
          base_price?: number
          discount_percent?: number
        }
        Update: {
          subcategory?: string
          base_price?: number
          discount_percent?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          grind_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          grind_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          grind_type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cart_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      machine_interest_requests: {
        Row: {
          id: string
          product_id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'machine_interest_requests_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      support_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      find_organization_by_domain: {
        Args: { input_domain: string }
        Returns: { id: string; name: string }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
