export type PendingCheckoutItem = {
  productName: string
  quantity: number
  imageUrl: string
  unit: string
  unitPriceTTC: number
  vatRate: number
}

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
          delivery_address: string | null
          sample_email: string | null
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          domain: string
          discount_rate?: number
          delivery_address?: string | null
          sample_email?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          discount_rate?: number
          delivery_address?: string | null
          sample_email?: string | null
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      signup_attempts: {
        Row: {
          id: string
          email: string
          full_name: string | null
          domain: string
          organization_id: string | null
          success: boolean
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          domain: string
          organization_id?: string | null
          success: boolean
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          domain?: string
          organization_id?: string | null
          success?: boolean
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'signup_attempts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      signup_attempt_reactions: {
        Row: {
          id: string
          attempt_id: string
          emoji: string
          staff_email: string
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          emoji: string
          staff_email: string
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          emoji?: string
          staff_email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'signup_attempt_reactions_attempt_id_fkey'
            columns: ['attempt_id']
            isOneToOne: false
            referencedRelation: 'signup_attempts'
            referencedColumns: ['id']
          }
        ]
      }
      signup_attempt_comments: {
        Row: {
          id: string
          attempt_id: string
          author_email: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          author_email: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          author_email?: string
          body?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'signup_attempt_comments_attempt_id_fkey'
            columns: ['attempt_id']
            isOneToOne: false
            referencedRelation: 'signup_attempts'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          organization_id: string | null
          billing_address: string | null
          default_address_id: string | null
          email: string | null
          created_at: string | null
          is_suspended: boolean
          mfa_recovery_bypass_until: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          organization_id?: string | null
          billing_address?: string | null
          default_address_id?: string | null
          email?: string | null
          created_at?: string | null
          is_suspended?: boolean
          mfa_recovery_bypass_until?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          organization_id?: string | null
          billing_address?: string | null
          default_address_id?: string | null
          email?: string | null
          created_at?: string | null
          is_suspended?: boolean
          mfa_recovery_bypass_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_default_address_id_fkey'
            columns: ['default_address_id']
            isOneToOne: false
            referencedRelation: 'organization_addresses'
            referencedColumns: ['id']
          }
        ]
      }
      orders_legacy_unused: {
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
          short_description: string | null
          flavor_tags: string[]
          price: number | null
          image_url: string | null
          hover_image_url: string | null
          sort_order: number
          purchasable: boolean
          active: boolean
          net_weight_grams: number
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          subcategory?: string | null
          tag?: string | null
          name: string
          description?: string | null
          short_description?: string | null
          flavor_tags?: string[]
          price?: number | null
          image_url?: string | null
          hover_image_url?: string | null
          sort_order?: number
          purchasable?: boolean
          active?: boolean
          net_weight_grams?: number
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          subcategory?: string | null
          tag?: string | null
          name?: string
          description?: string | null
          short_description?: string | null
          flavor_tags?: string[]
          price?: number | null
          image_url?: string | null
          hover_image_url?: string | null
          sort_order?: number
          purchasable?: boolean
          active?: boolean
          net_weight_grams?: number
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
      organization_addresses: {
        Row: {
          id: string
          organization_id: string
          label: string
          address: string
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          label: string
          address: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          label?: string
          address?: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_addresses_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      organization_sample_emails: {
        Row: {
          id: string
          organization_id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_sample_emails_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      organization_coffee_discounts: {
        Row: {
          organization_id: string
          subcategory: string
          discount_amount: number
        }
        Insert: {
          organization_id: string
          subcategory: string
          discount_amount?: number
        }
        Update: {
          organization_id?: string
          subcategory?: string
          discount_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: 'organization_coffee_discounts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      manual_orders: {
        Row: {
          id: string
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          paid: boolean
          payment_link: string | null
          order_date: string
          comment: string | null
          payment_method: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          paid?: boolean
          payment_link?: string | null
          order_date?: string
          comment?: string | null
          payment_method?: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          profile_id?: string
          organization_id?: string
          employee_name?: string
          employee_email?: string
          billing_address?: string
          delivery_mode?: string
          address?: string
          amount?: number
          paid?: boolean
          payment_link?: string | null
          order_date?: string
          comment?: string | null
          payment_method?: string
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'manual_orders_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'manual_orders_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      manual_order_items: {
        Row: {
          id: string
          manual_order_id: string
          product_name: string
          quantity: number
          image_url: string
          unit: string
          unit_price_ttc: number
          vat_rate: number
        }
        Insert: {
          id?: string
          manual_order_id: string
          product_name: string
          quantity: number
          image_url: string
          unit: string
          unit_price_ttc: number
          vat_rate: number
        }
        Update: {
          id?: string
          manual_order_id?: string
          product_name?: string
          quantity?: number
          image_url?: string
          unit?: string
          unit_price_ttc?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: 'manual_order_items_manual_order_id_fkey'
            columns: ['manual_order_id']
            isOneToOne: false
            referencedRelation: 'manual_orders'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          status: string
          payment_status: string
          paid: boolean
          cawl_hosted_checkout_id: string | null
          cawl_payment_id: string | null
          invoice_number: string | null
          invoice_pdf_path: string | null
          delivery_note_number: string | null
          delivery_note_pdf_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          status?: string
          payment_status?: string
          paid?: boolean
          cawl_hosted_checkout_id?: string | null
          cawl_payment_id?: string | null
          invoice_number?: string | null
          invoice_pdf_path?: string | null
          delivery_note_number?: string | null
          delivery_note_pdf_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          profile_id?: string
          organization_id?: string
          employee_name?: string
          employee_email?: string
          billing_address?: string
          delivery_mode?: string
          address?: string
          amount?: number
          status?: string
          payment_status?: string
          paid?: boolean
          cawl_hosted_checkout_id?: string | null
          cawl_payment_id?: string | null
          invoice_number?: string | null
          invoice_pdf_path?: string | null
          delivery_note_number?: string | null
          delivery_note_pdf_path?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      pending_checkouts: {
        Row: {
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          items: PendingCheckoutItem[]
          created_at: string
        }
        Insert: {
          order_number: string
          profile_id: string
          organization_id: string
          employee_name: string
          employee_email: string
          billing_address: string
          delivery_mode: string
          address: string
          amount: number
          items: PendingCheckoutItem[]
          created_at?: string
        }
        Update: {
          order_number?: string
          profile_id?: string
          organization_id?: string
          employee_name?: string
          employee_email?: string
          billing_address?: string
          delivery_mode?: string
          address?: string
          amount?: number
          items?: PendingCheckoutItem[]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pending_checkouts_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pending_checkouts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          image_url: string
          unit: string
          unit_price_ttc: number
          vat_rate: number
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          image_url: string
          unit: string
          unit_price_ttc: number
          vat_rate: number
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          image_url?: string
          unit?: string
          unit_price_ttc?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          actor: string
          action: string
          at: string
        }
        Insert: {
          id?: string
          order_id: string
          actor: string
          action: string
          at?: string
        }
        Update: {
          id?: string
          order_id?: string
          actor?: string
          action?: string
          at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_status_history_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      order_refunds: {
        Row: {
          id: string
          order_id: string
          amount: number
          reason: string
          actor: string
          refund_number: string | null
          pdf_path: string | null
          at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          reason: string
          actor: string
          refund_number?: string | null
          pdf_path?: string | null
          at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          reason?: string
          actor?: string
          refund_number?: string | null
          pdf_path?: string | null
          at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_refunds_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      document_sequences: {
        Row: {
          series: string
          year: number
          last_number: number
        }
        Insert: {
          series: string
          year: number
          last_number?: number
        }
        Update: {
          series?: string
          year?: number
          last_number?: number
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
      password_history: {
        Row: {
          id: string
          user_id: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          password_hash?: string
          created_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          subscription: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          subscription: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          subscription?: Record<string, unknown>
          created_at?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          id: string
          event_type: string
          email: string | null
          detail: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          email?: string | null
          detail?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          email?: string | null
          detail?: string | null
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
      next_document_number: {
        Args: { p_series: string; p_year: number }
        Returns: number
      }
      next_order_number: {
        Args: { p_year: number }
        Returns: number
      }
      generate_mfa_recovery_codes: {
        Args: { p_code_hashes: string[] }
        Returns: undefined
      }
      consume_mfa_recovery_code: {
        Args: { p_code_hash: string }
        Returns: boolean
      }
      get_push_subscriptions_for_notify: {
        Args: Record<PropertyKey, never>
        Returns: { id: string; subscription: Record<string, unknown> }[]
      }
      prune_push_subscription: {
        Args: { p_id: string }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
