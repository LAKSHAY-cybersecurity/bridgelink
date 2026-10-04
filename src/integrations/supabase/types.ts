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
  public: {
    Tables: {
      application_uploads: {
        Row: {
          application_id: string
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          upload_label: string
        }
        Insert: {
          application_id: string
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          upload_label?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          upload_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_uploads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          id: string
          slot_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          slot_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          slot_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "referral_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fraud_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          resolved: boolean | null
          severity: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          resolved?: boolean | null
          severity?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          reason: string | null
          toxicity_score: number | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          reason?: string | null
          toxicity_score?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          reason?: string | null
          toxicity_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          behavioral_score: number | null
          bio: string | null
          branch: string | null
          bridge_code: string | null
          certifications: string[] | null
          cgpa: number | null
          college: string | null
          company: string | null
          created_at: string
          credibility_score: number | null
          education: string | null
          full_name: string | null
          github_integrity_score: number | null
          github_username: string | null
          graduation_year: number | null
          id: string
          job_title: string | null
          leetcode_authenticity_score: number | null
          leetcode_username: string | null
          linkedin_url: string | null
          portfolio_strength_score: number | null
          referral_readiness_score: number | null
          resume_url: string | null
          role: string | null
          skills: string[] | null
          suspended: boolean | null
          trust_score: number | null
          updated_at: string
          user_id: string
          username: string | null
          verified: boolean | null
          work_email: string | null
        }
        Insert: {
          behavioral_score?: number | null
          bio?: string | null
          branch?: string | null
          bridge_code?: string | null
          certifications?: string[] | null
          cgpa?: number | null
          college?: string | null
          company?: string | null
          created_at?: string
          credibility_score?: number | null
          education?: string | null
          full_name?: string | null
          github_integrity_score?: number | null
          github_username?: string | null
          graduation_year?: number | null
          id?: string
          job_title?: string | null
          leetcode_authenticity_score?: number | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          portfolio_strength_score?: number | null
          referral_readiness_score?: number | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          suspended?: boolean | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          verified?: boolean | null
          work_email?: string | null
        }
        Update: {
          behavioral_score?: number | null
          bio?: string | null
          branch?: string | null
          bridge_code?: string | null
          certifications?: string[] | null
          cgpa?: number | null
          college?: string | null
          company?: string | null
          created_at?: string
          credibility_score?: number | null
          education?: string | null
          full_name?: string | null
          github_integrity_score?: number | null
          github_username?: string | null
          graduation_year?: number | null
          id?: string
          job_title?: string | null
          leetcode_authenticity_score?: number | null
          leetcode_username?: string | null
          linkedin_url?: string | null
          portfolio_strength_score?: number | null
          referral_readiness_score?: number | null
          resume_url?: string | null
          role?: string | null
          skills?: string[] | null
          suspended?: boolean | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verified?: boolean | null
          work_email?: string | null
        }
        Relationships: []
      }
      referral_completions: {
        Row: {
          application_id: string
          created_at: string
          id: string
          referral_file_name: string | null
          referral_file_url: string | null
          referrer_message: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          referral_file_name?: string | null
          referral_file_url?: string | null
          referrer_message: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          referral_file_name?: string | null
          referral_file_url?: string | null
          referrer_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_completions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_slots: {
        Row: {
          company: string
          created_at: string
          description: string | null
          dynamic_criteria: Json | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          location: string
          min_trust_score: number | null
          referrer_id: string
          required_skills: string[] | null
          required_uploads: Json | null
          role_title: string
          slots_remaining: number
          total_slots: number
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          dynamic_criteria?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          min_trust_score?: number | null
          referrer_id: string
          required_skills?: string[] | null
          required_uploads?: Json | null
          role_title: string
          slots_remaining?: number
          total_slots?: number
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          dynamic_criteria?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          min_trust_score?: number | null
          referrer_id?: string
          required_skills?: string[] | null
          required_uploads?: Json | null
          role_title?: string
          slots_remaining?: number
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      referrer_credits: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "referrer" | "student"
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
  public: {
    Enums: {
      app_role: ["admin", "referrer", "student"],
    },
  },
} as const
