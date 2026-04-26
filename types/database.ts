export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LeadUrgency = 'low' | 'medium' | 'high' | 'emergency'
export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'sold' | 'rejected'
export type ModelType = 'rank_rent' | 'pay_per_lead' | 'exclusive'
export type PaymentType = 'subscription' | 'per_lead'

export type Database = {
  public: {
    Tables: {
      niches: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          base_lead_price: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          base_lead_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          base_lead_price?: number
          created_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          city: string
          state: string
          zip_codes: string[]
          slug: string
          lat: number | null
          lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          city: string
          state: string
          zip_codes?: string[]
          slug: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          city?: string
          state?: string
          zip_codes?: string[]
          slug?: string
          lat?: number | null
          lng?: number | null
          created_at?: string
        }
        Relationships: []
      }
      contractors: {
        Row: {
          id: string
          user_id: string
          company_name: string
          phone: string | null
          email: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_tier: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          phone?: string | null
          email: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          phone?: string | null
          email?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      niche_locations: {
        Row: {
          id: string
          niche_id: string
          location_id: string
          assigned_contractor_id: string | null
          is_active: boolean
          monthly_rate: number | null
          model_type: ModelType
          created_at: string
        }
        Insert: {
          id?: string
          niche_id: string
          location_id: string
          assigned_contractor_id?: string | null
          is_active?: boolean
          monthly_rate?: number | null
          model_type?: ModelType
          created_at?: string
        }
        Update: {
          id?: string
          niche_id?: string
          location_id?: string
          assigned_contractor_id?: string | null
          is_active?: boolean
          monthly_rate?: number | null
          model_type?: ModelType
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          niche_location_id: string | null
          contractor_id: string | null
          name: string
          phone: string
          email: string | null
          service_type: string
          urgency_score: number | null
          urgency_label: LeadUrgency
          ai_summary: string | null
          status: LeadStatus
          source_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          niche_location_id?: string | null
          contractor_id?: string | null
          name: string
          phone: string
          email?: string | null
          service_type: string
          urgency_score?: number | null
          urgency_label?: LeadUrgency
          ai_summary?: string | null
          status?: LeadStatus
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          niche_location_id?: string | null
          contractor_id?: string | null
          name?: string
          phone?: string
          email?: string | null
          service_type?: string
          urgency_score?: number | null
          urgency_label?: LeadUrgency
          ai_summary?: string | null
          status?: LeadStatus
          source_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          id: string
          lead_id: string
          event_type: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          event_type: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          event_type?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          contractor_id: string | null
          stripe_payment_intent_id: string | null
          amount: number
          lead_id: string | null
          type: PaymentType
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          contractor_id?: string | null
          stripe_payment_intent_id?: string | null
          amount: number
          lead_id?: string | null
          type: PaymentType
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          contractor_id?: string | null
          stripe_payment_intent_id?: string | null
          amount?: number
          lead_id?: string | null
          type?: PaymentType
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      lead_urgency: LeadUrgency
      lead_status: LeadStatus
      model_type: ModelType
      payment_type: PaymentType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Niche = Database['public']['Tables']['niches']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Contractor = Database['public']['Tables']['contractors']['Row']
export type NicheLocation = Database['public']['Tables']['niche_locations']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadEvent = Database['public']['Tables']['lead_events']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']

// Joined types used across the app
export type NicheLocationWithRelations = NicheLocation & {
  niche: Niche
  location: Location
  contractor: Contractor | null
}

export type LeadWithRelations = Lead & {
  niche_location: NicheLocationWithRelations | null
  contractor: Contractor | null
}
