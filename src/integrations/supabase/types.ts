export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audio_files: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          file_size: number | null
          filename: string | null
          id: string
          status: string
          title: string
          updated_at: string | null
          used_in_job: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          used_in_job?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          used_in_job?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          package_id: string | null
          service: string | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          package_id?: string | null
          service?: string | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          package_id?: string | null
          service?: string | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dubbing_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          languages: string[]
          output_url: string | null
          sieve_job_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          languages: string[]
          output_url?: string | null
          sieve_job_id: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          languages?: string[]
          output_url?: string | null
          sieve_job_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          environment: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
          rollout_percentage: number | null
          target_users: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environment?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_users?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environment?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
          rollout_percentage?: number | null
          target_users?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_cents: number
          billing_address: Json | null
          created_at: string | null
          credits_purchased: number | null
          currency: string | null
          id: string
          payment_method: string | null
          payment_status: string
          receipt_url: string | null
          refund_amount_cents: number | null
          refunded_at: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subscription_plan: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          billing_address?: Json | null
          created_at?: string | null
          credits_purchased?: number | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_status: string
          receipt_url?: string | null
          refund_amount_cents?: number | null
          refunded_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          billing_address?: Json | null
          created_at?: string | null
          credits_purchased?: number | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string
          receipt_url?: string | null
          refund_amount_cents?: number | null
          refunded_at?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_usage_logs: {
        Row: {
          cost_in_credits: number | null
          created_at: string
          credits_used: number
          error_details: string | null
          id: string
          input_size: number | null
          job_id: string | null
          metadata: Json | null
          output_size: number | null
          processing_time: number | null
          quality_settings: Json | null
          service_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          cost_in_credits?: number | null
          created_at?: string
          credits_used?: number
          error_details?: string | null
          id?: string
          input_size?: number | null
          job_id?: string | null
          metadata?: Json | null
          output_size?: number | null
          processing_time?: number | null
          quality_settings?: Json | null
          service_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          cost_in_credits?: number | null
          created_at?: string
          credits_used?: number
          error_details?: string | null
          id?: string
          input_size?: number | null
          job_id?: string | null
          metadata?: Json | null
          output_size?: number | null
          processing_time?: number | null
          quality_settings?: Json | null
          service_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          monthly_credits: number | null
          plan_id: string
          status: string | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          monthly_credits?: number | null
          plan_id: string
          status?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          monthly_credits?: number | null
          plan_id?: string
          status?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subtitle_jobs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          language: string | null
          model_name: string
          original_filename: string | null
          prediction_id: string | null
          preview_text: string | null
          srt_url: string | null
          status: string
          updated_at: string
          user_id: string
          vtt_url: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          language?: string | null
          model_name: string
          original_filename?: string | null
          prediction_id?: string | null
          preview_text?: string | null
          srt_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vtt_url?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          language?: string | null
          model_name?: string
          original_filename?: string | null
          prediction_id?: string | null
          preview_text?: string | null
          srt_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vtt_url?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_balance: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_balance?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          language_preference: string | null
          last_active_at: string | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          last_active_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language_preference?: string | null
          last_active_at?: string | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      video_analytics: {
        Row: {
          comments: number | null
          created_at: string | null
          id: string
          likes: number | null
          title: string
          updated_at: string | null
          user_id: string
          video_id: string
          views: number | null
          watch_time: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          title: string
          updated_at?: string | null
          user_id: string
          video_id: string
          views?: number | null
          watch_time?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          id?: string
          likes?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
          views?: number | null
          watch_time?: number | null
        }
        Relationships: []
      }
      video_clips: {
        Row: {
          aspect_ratio: string
          cost_credits: number
          created_at: string
          duration: number
          end_frame_url: string | null
          id: string
          prompt: string
          start_frame_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          aspect_ratio: string
          cost_credits?: number
          created_at?: string
          duration: number
          end_frame_url?: string | null
          id?: string
          prompt: string
          start_frame_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          aspect_ratio?: string
          cost_credits?: number
          created_at?: string
          duration?: number
          end_frame_url?: string | null
          id?: string
          prompt?: string
          start_frame_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          file_size: number | null
          filename: string | null
          id: string
          status: string
          title: string
          updated_at: string
          used_in_job: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          used_in_job?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          used_in_job?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_credits: {
        Args: { user_id_param: string; credits_balance_param: number }
        Returns: {
          created_at: string | null
          credits_balance: number
          id: string
          updated_at: string | null
          user_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
