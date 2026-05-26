// NOTE: Keep in sync with the DB by running:
//   npx supabase gen types typescript --project-id <id> > supabase/types.ts
// The types below are the hand-written source of truth until the first gen run.

export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled'
export type PlanTier = 'start' | 'team' | 'business'

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          billing_email: string
          default_locale: string
          timezone: string
          plan: PlanTier
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          locale: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      memberships: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'memberships_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          id: string
          org_id: string
          parent_id: string | null
          name: string
          geo: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['departments']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['departments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'departments_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'departments_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      manager_departments: {
        Row: {
          membership_id: string
          department_id: string
        }
        Insert: Database['public']['Tables']['manager_departments']['Row']
        Update: Partial<Database['public']['Tables']['manager_departments']['Row']>
        Relationships: [
          {
            foreignKeyName: 'manager_departments_membership_id_fkey'
            columns: ['membership_id']
            isOneToOne: false
            referencedRelation: 'memberships'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'manager_departments_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      employees: {
        Row: {
          id: string
          org_id: string
          dept_id: string | null
          full_name: string
          position: string | null
          sort_order: number
          deleted_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'employees_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'employees_dept_id_fkey'
            columns: ['dept_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      status_types: {
        Row: {
          id: string
          org_id: string | null
          code: string
          label: Record<'ru' | 'uk' | 'en', string>
          color: string
          counts_as_present: boolean
          is_system: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['status_types']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['status_types']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'status_types_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      schedule_entries: {
        Row: {
          id: string
          org_id: string
          employee_id: string
          entry_date: string          // ISO date "YYYY-MM-DD"
          status_id: string
          note: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['schedule_entries']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['schedule_entries']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'schedule_entries_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schedule_entries_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'schedule_entries_status_id_fkey'
            columns: ['status_id']
            isOneToOne: false
            referencedRelation: 'status_types'
            referencedColumns: ['id']
          },
        ]
      }
      alert_configs: {
        Row: {
          id: string
          org_id: string
          department_id: string
          min_present: number
          notify_user_ids: string[]
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['alert_configs']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['alert_configs']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'alert_configs_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alert_configs_department_id_fkey'
            columns: ['department_id']
            isOneToOne: false
            referencedRelation: 'departments'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          org_id: string
          plan: PlanTier
          status: SubscriptionStatus
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'subscriptions_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      webhook_events: {
        Row: {
          id: string
          type: string
          payload: Record<string, unknown>
          processed_at: string
        }
        Insert: Database['public']['Tables']['webhook_events']['Row']
        Update: Partial<Database['public']['Tables']['webhook_events']['Row']>
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          org_id: string
          email: string
          role: UserRole
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invitations']['Row'], 'id' | 'created_at' | 'accepted_at'> & { id?: string; accepted_at?: string | null }
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'invitations_org_id_fkey'
            columns: ['org_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      auth_org_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      visible_department_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      create_organization: {
        Args: {
          p_name: string
          p_slug: string
          p_billing_email: string
          p_timezone?: string
          p_locale?: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      subscription_status: SubscriptionStatus
      plan_tier: PlanTier
    }
  }
}
