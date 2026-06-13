export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alert_configs: {
        Row: {
          created_at: string
          department_id: string
          id: string
          is_active: boolean
          min_present: number
          notify_user_ids: string[]
          org_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          is_active?: boolean
          min_present?: number
          notify_user_ids?: string[]
          org_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          is_active?: boolean
          min_present?: number
          notify_user_ids?: string[]
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_configs_department_id_fkey"
            columns: ["department_id", "org_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "alert_configs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          geo: string | null
          id: string
          name: string
          org_id: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          geo?: string | null
          id?: string
          name: string
          org_id: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          geo?: string | null
          id?: string
          name?: string
          org_id?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id", "org_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "org_id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          created_at: string
          deleted_at: string | null
          dept_id: string | null
          email: string | null
          employment_kind: string
          full_name: string
          hired_on: string | null
          id: string
          note: string | null
          org_id: string
          phone: string | null
          position: string | null
          sort_order: number
          telegram: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          deleted_at?: string | null
          dept_id?: string | null
          email?: string | null
          employment_kind?: string
          full_name: string
          hired_on?: string | null
          id?: string
          note?: string | null
          org_id: string
          phone?: string | null
          position?: string | null
          sort_order?: number
          telegram?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string
          deleted_at?: string | null
          dept_id?: string | null
          email?: string | null
          employment_kind?: string
          full_name?: string
          hired_on?: string | null
          id?: string
          note?: string | null
          org_id?: string
          phone?: string | null
          position?: string | null
          sort_order?: number
          telegram?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_dept_id_fkey"
            columns: ["dept_id", "org_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "employees_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grid_view_settings: {
        Row: {
          org_id: string
          settings: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          org_id: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          org_id?: string
          settings?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grid_view_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_departments: {
        Row: {
          department_id: string
          membership_id: string
        }
        Insert: {
          department_id: string
          membership_id: string
        }
        Update: {
          department_id?: string
          membership_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_departments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          acquisition_source: string | null
          billing_email: string
          created_at: string
          default_locale: string
          id: string
          logo_url: string | null
          name: string
          plan: Database["public"]["Enums"]["plan_tier"]
          slug: string
          timezone: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          acquisition_source?: string | null
          billing_email: string
          created_at?: string
          default_locale?: string
          id?: string
          logo_url?: string | null
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          slug: string
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          acquisition_source?: string | null
          billing_email?: string
          created_at?: string
          default_locale?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          slug?: string
          timezone?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string | null
        }
        Relationships: []
      }
      schedule_entries: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          end_time: string | null
          entry_date: string
          id: string
          note: string | null
          org_id: string
          start_time: string | null
          status_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          end_time?: string | null
          entry_date: string
          id?: string
          note?: string | null
          org_id: string
          start_time?: string | null
          status_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          end_time?: string | null
          entry_date?: string
          id?: string
          note?: string | null
          org_id?: string
          start_time?: string | null
          status_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_employee_id_fkey"
            columns: ["employee_id", "org_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id", "org_id"]
          },
          {
            foreignKeyName: "schedule_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_entries_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "status_types"
            referencedColumns: ["id"]
          },
        ]
      }
      status_types: {
        Row: {
          code: string
          color: string
          counts_as_present: boolean
          created_at: string
          end_time: string | null
          id: string
          is_system: boolean
          label: Json
          org_id: string | null
          sort_order: number
          start_time: string | null
        }
        Insert: {
          code: string
          color: string
          counts_as_present?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          is_system?: boolean
          label: Json
          org_id?: string | null
          sort_order?: number
          start_time?: string | null
        }
        Update: {
          code?: string
          color?: string
          counts_as_present?: boolean
          created_at?: string
          end_time?: string | null
          id?: string
          is_system?: boolean
          label?: Json
          org_id?: string | null
          sort_order?: number
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_types_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          org_id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          org_id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          id: string
          payload: Json
          processed_at: string
          type: string
        }
        Insert: {
          id: string
          payload: Json
          processed_at?: string
          type: string
        }
        Update: {
          id?: string
          payload?: Json
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: string }
      auth_has_role: {
        Args: {
          p_org_id: string
          p_roles: Database["public"]["Enums"]["user_role"][]
        }
        Returns: boolean
      }
      auth_org_ids: { Args: never; Returns: string[] }
      create_invitation: {
        Args: {
          p_email: string
          p_org_id: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      create_organization: {
        Args: {
          p_acquisition_source?: string
          p_billing_email: string
          p_locale?: string
          p_name: string
          p_slug: string
          p_timezone?: string
        }
        Returns: string
      }
      get_invitation: {
        Args: { p_token: string }
        Returns: {
          accepted_at: string
          email: string
          expires_at: string
          org_name: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      remove_member: {
        Args: { p_org_id: string; p_user_id: string }
        Returns: undefined
      }
      reorder_employees: {
        Args: { p_dept_id?: string; p_ordered_ids: string[] }
        Returns: undefined
      }
      update_member_role: {
        Args: {
          p_org_id: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      visible_department_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      plan_tier: "start" | "team" | "business"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "canceled"
      user_role: "owner" | "admin" | "manager" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      plan_tier: ["start", "team", "business"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "paused",
        "canceled",
      ],
      user_role: ["owner", "admin", "manager", "viewer"],
    },
  },
} as const

// ─── App-friendly aliases (preserve existing imports) ───────────────────────
export type UserRole = Database['public']['Enums']['user_role']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type PlanTier = Database['public']['Enums']['plan_tier']
