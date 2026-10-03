export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          locale: string;
          timezone: string;
          body_display_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          locale?: string;
          timezone?: string;
          body_display_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          display_name?: string | null;
          locale?: string;
          timezone?: string;
          body_display_preference?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          local_date: string;
          local_timezone: string;
          energy_level: number | null;
          overall_note: string | null;
          body_status: string | null;
          capture_type: string;
          idempotency_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      checkin_observations: {
        Row: {
          id: string;
          checkin_id: string;
          user_id: string;
          region_code: string;
          state: string;
          level: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_my_consent: {
        Args: {
          p_purpose: string;
          p_action: string;
          p_policy_version: string;
          p_source: string;
          p_idempotency_key: string;
          p_channel: string;
        };
        Returns: string | null;
      };
      get_my_consent_state: { Args: Record<string, never>; Returns: Json };
      get_my_consent_policy_versions: { Args: Record<string, never>; Returns: Json };
      save_my_checkin_for_current_user_with_current_consent: {
        Args: {
          p_expected_user_id: string;
          p_local_date: string;
          p_local_timezone: string;
          p_energy_level: number | null;
          p_body_status: string | null;
          p_capture_type: string;
          p_observations: Json;
          p_idempotency_key: string;
        };
        Returns: { checkin_id: string; created_at: string }[];
      };
      delete_my_checkin: { Args: { p_checkin_id: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
