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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          dealership_id: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          dealership_id?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          dealership_id?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_users_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      audits: {
        Row: {
          action: string
          compliance_category: string | null
          created_at: string | null
          dealership_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          retention_period: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          compliance_category?: string | null
          created_at?: string | null
          dealership_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          retention_period?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          compliance_category?: string | null
          created_at?: string | null
          dealership_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          retention_period?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomous_decisions: {
        Row: {
          agent_type: string
          anomalies: Json | null
          confidence: number | null
          context: Json
          created_at: string | null
          decision_data: Json
          decision_type: string
          event_type: string
          executed_at: string | null
          execution_result: Json | null
          id: string
          impact_metrics: Json | null
          metrics: Json | null
          rollback_data: Json | null
          success: boolean | null
        }
        Insert: {
          agent_type: string
          anomalies?: Json | null
          confidence?: number | null
          context: Json
          created_at?: string | null
          decision_data: Json
          decision_type: string
          event_type: string
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          impact_metrics?: Json | null
          metrics?: Json | null
          rollback_data?: Json | null
          success?: boolean | null
        }
        Update: {
          agent_type?: string
          anomalies?: Json | null
          confidence?: number | null
          context?: Json
          created_at?: string | null
          decision_data?: Json
          decision_type?: string
          event_type?: string
          executed_at?: string | null
          execution_result?: Json | null
          id?: string
          impact_metrics?: Json | null
          metrics?: Json | null
          rollback_data?: Json | null
          success?: boolean | null
        }
        Relationships: []
      }
      blobs: {
        Row: {
          access_policy: Json | null
          checksum: string
          content_type: string
          created_at: string | null
          dealership_id: string | null
          encryption_algorithm: string | null
          expires_at: string | null
          filename: string
          id: string
          key_derivation: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          access_policy?: Json | null
          checksum: string
          content_type: string
          created_at?: string | null
          dealership_id?: string | null
          encryption_algorithm?: string | null
          expires_at?: string | null
          filename: string
          id?: string
          key_derivation?: string | null
          size_bytes: number
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          access_policy?: Json | null
          checksum?: string
          content_type?: string
          created_at?: string | null
          dealership_id?: string | null
          encryption_algorithm?: string | null
          expires_at?: string | null
          filename?: string
          id?: string
          key_derivation?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blobs_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blobs_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bureau_authorizations: {
        Row: {
          authorization_token: string
          authorized_at: string
          bureau_name: string
          created_at: string | null
          credit_app_id: string | null
          expires_at: string | null
          id: string
          pull_type: string
          report_data: Json | null
          used_at: string | null
        }
        Insert: {
          authorization_token: string
          authorized_at: string
          bureau_name: string
          created_at?: string | null
          credit_app_id?: string | null
          expires_at?: string | null
          id?: string
          pull_type: string
          report_data?: Json | null
          used_at?: string | null
        }
        Update: {
          authorization_token?: string
          authorized_at?: string
          bureau_name?: string
          created_at?: string | null
          credit_app_id?: string | null
          expires_at?: string | null
          id?: string
          pull_type?: string
          report_data?: Json | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bureau_authorizations_credit_app_id_fkey"
            columns: ["credit_app_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          consent_type: string
          created_at: string | null
          credit_app_id: string | null
          customer_id: string | null
          device_fingerprint: string | null
          geolocation: Json | null
          granted: boolean
          id: string
          ip_address: unknown | null
          language: string
          legal_text_hash: string
          signature_data: Json | null
          signature_method: string | null
          timestamp: string
          user_agent: string | null
          witness_info: Json | null
        }
        Insert: {
          consent_type: string
          created_at?: string | null
          credit_app_id?: string | null
          customer_id?: string | null
          device_fingerprint?: string | null
          geolocation?: Json | null
          granted: boolean
          id?: string
          ip_address?: unknown | null
          language?: string
          legal_text_hash: string
          signature_data?: Json | null
          signature_method?: string | null
          timestamp?: string
          user_agent?: string | null
          witness_info?: Json | null
        }
        Update: {
          consent_type?: string
          created_at?: string | null
          credit_app_id?: string | null
          customer_id?: string | null
          device_fingerprint?: string | null
          geolocation?: Json | null
          granted?: boolean
          id?: string
          ip_address?: unknown | null
          language?: string
          legal_text_hash?: string
          signature_data?: Json | null
          signature_method?: string | null
          timestamp?: string
          user_agent?: string | null
          witness_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_credit_app_id_fkey"
            columns: ["credit_app_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          applicant_data: Json
          application_number: string
          approved_lenders: Json | null
          assets: Json | null
          bureau_report: Json | null
          co_applicant_data: Json | null
          created_at: string | null
          credit_score: number | null
          customer_id: string | null
          dealership_id: string | null
          decision: string | null
          decision_date: string | null
          decision_details: Json | null
          employment_info: Json
          id: string
          income_verification: Json | null
          liabilities: Json | null
          monthly_expenses: number | null
          quote_id: string | null
          status: string | null
          submitted_lenders: string[] | null
          updated_at: string | null
        }
        Insert: {
          applicant_data: Json
          application_number: string
          approved_lenders?: Json | null
          assets?: Json | null
          bureau_report?: Json | null
          co_applicant_data?: Json | null
          created_at?: string | null
          credit_score?: number | null
          customer_id?: string | null
          dealership_id?: string | null
          decision?: string | null
          decision_date?: string | null
          decision_details?: Json | null
          employment_info: Json
          id?: string
          income_verification?: Json | null
          liabilities?: Json | null
          monthly_expenses?: number | null
          quote_id?: string | null
          status?: string | null
          submitted_lenders?: string[] | null
          updated_at?: string | null
        }
        Update: {
          applicant_data?: Json
          application_number?: string
          approved_lenders?: Json | null
          assets?: Json | null
          bureau_report?: Json | null
          co_applicant_data?: Json | null
          created_at?: string | null
          credit_score?: number | null
          customer_id?: string | null
          dealership_id?: string | null
          decision?: string | null
          decision_date?: string | null
          decision_details?: Json | null
          employment_info?: Json
          id?: string
          income_verification?: Json | null
          liabilities?: Json | null
          monthly_expenses?: number | null
          quote_id?: string | null
          status?: string | null
          submitted_lenders?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          assigned_to: string | null
          created_at: string | null
          credit_score: number | null
          dealership_id: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          preferences: Json | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          credit_score?: number | null
          dealership_id?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          assigned_to?: string | null
          created_at?: string | null
          credit_score?: number | null
          dealership_id?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      dealerships: {
        Row: {
          address: Json | null
          branding: Json | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          license_number: string | null
          name: string
          phone: string | null
          province: string
          settings: Json | null
          tax_config: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          branding?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          province: string
          settings?: Json | null
          tax_config?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          branding?: Json | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          province?: string
          settings?: Json | null
          tax_config?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          category: string
          config: Json
          created_at: string | null
          credentials_encrypted: string | null
          dealership_id: string | null
          error_count: number | null
          field_mappings: Json | null
          health_status: string | null
          id: string
          last_error: string | null
          last_health_check: string | null
          last_sync_at: string | null
          provider_id: string
          status: string | null
          sync_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          config: Json
          created_at?: string | null
          credentials_encrypted?: string | null
          dealership_id?: string | null
          error_count?: number | null
          field_mappings?: Json | null
          health_status?: string | null
          id?: string
          last_error?: string | null
          last_health_check?: string | null
          last_sync_at?: string | null
          provider_id: string
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          config?: Json
          created_at?: string | null
          credentials_encrypted?: string | null
          dealership_id?: string | null
          error_count?: number | null
          field_mappings?: Json | null
          health_status?: string | null
          id?: string
          last_error?: string | null
          last_health_check?: string | null
          last_sync_at?: string | null
          provider_id?: string
          status?: string | null
          sync_frequency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_sync_logs: {
        Row: {
          completed_at: string | null
          error_details: Json | null
          id: string
          integration_id: string | null
          records_added: number | null
          records_processed: number | null
          records_removed: number | null
          records_updated: number | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          integration_id?: string | null
          records_added?: number | null
          records_processed?: number | null
          records_removed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          error_details?: Json | null
          id?: string
          integration_id?: string | null
          records_added?: number | null
          records_processed?: number | null
          records_removed?: number | null
          records_updated?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      key_envelopes: {
        Row: {
          access_granted_at: string | null
          accessed_at: string | null
          blob_id: string | null
          encrypted_key: string
          id: string
          recipient_id: string | null
          revoked_at: string | null
        }
        Insert: {
          access_granted_at?: string | null
          accessed_at?: string | null
          blob_id?: string | null
          encrypted_key: string
          id?: string
          recipient_id?: string | null
          revoked_at?: string | null
        }
        Update: {
          access_granted_at?: string | null
          accessed_at?: string | null
          blob_id?: string | null
          encrypted_key?: string
          id?: string
          recipient_id?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_envelopes_blob_id_fkey"
            columns: ["blob_id"]
            isOneToOne: false
            referencedRelation: "blobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "key_envelopes_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_checks: {
        Row: {
          check_type: string
          confidence_score: number | null
          customer_id: string | null
          expires_at: string | null
          id: string
          performed_at: string | null
          provider: string | null
          reference_id: string | null
          status: string | null
          verification_data: Json | null
        }
        Insert: {
          check_type: string
          confidence_score?: number | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          performed_at?: string | null
          provider?: string | null
          reference_id?: string | null
          status?: string | null
          verification_data?: Json | null
        }
        Update: {
          check_type?: string
          confidence_score?: number | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          performed_at?: string | null
          provider?: string | null
          reference_id?: string | null
          status?: string | null
          verification_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_checks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: Json | null
          contact_preferences: Json | null
          created_at: string | null
          customer_id: string | null
          dealership_id: string | null
          id: string
          interest_type: string | null
          last_contact_at: string | null
          metadata: Json | null
          next_followup_at: string | null
          notes: string | null
          score: number | null
          source: string
          status: string | null
          timeline: string | null
          updated_at: string | null
          vehicle_preferences: Json | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: Json | null
          contact_preferences?: Json | null
          created_at?: string | null
          customer_id?: string | null
          dealership_id?: string | null
          id?: string
          interest_type?: string | null
          last_contact_at?: string | null
          metadata?: Json | null
          next_followup_at?: string | null
          notes?: string | null
          score?: number | null
          source: string
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          vehicle_preferences?: Json | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: Json | null
          contact_preferences?: Json | null
          created_at?: string | null
          customer_id?: string | null
          dealership_id?: string | null
          id?: string
          interest_type?: string | null
          last_contact_at?: string | null
          metadata?: Json | null
          next_followup_at?: string | null
          notes?: string | null
          score?: number | null
          source?: string
          status?: string | null
          timeline?: string | null
          updated_at?: string | null
          vehicle_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          applies_to_departments: string[] | null
          applies_to_roles: string[] | null
          created_at: string | null
          dealership_id: string | null
          description: string | null
          effective_date: string | null
          enforcement_level: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          name: string
          policy_type: string
          rules: Json
          updated_at: string | null
        }
        Insert: {
          applies_to_departments?: string[] | null
          applies_to_roles?: string[] | null
          created_at?: string | null
          dealership_id?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          policy_type: string
          rules: Json
          updated_at?: string | null
        }
        Update: {
          applies_to_departments?: string[] | null
          applies_to_roles?: string[] | null
          created_at?: string | null
          dealership_id?: string | null
          description?: string | null
          effective_date?: string | null
          enforcement_level?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          policy_type?: string
          rules?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policies_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_revisions: {
        Row: {
          changed_by: string | null
          changes: Json
          created_at: string | null
          id: string
          quote_id: string | null
          reason: string | null
          revision_number: number
        }
        Insert: {
          changed_by?: string | null
          changes: Json
          created_at?: string | null
          id?: string
          quote_id?: string | null
          reason?: string | null
          revision_number: number
        }
        Update: {
          changed_by?: string | null
          changes?: Json
          created_at?: string | null
          id?: string
          quote_id?: string | null
          reason?: string | null
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accessories: Json | null
          admin_fee: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          dealer_fee: number | null
          dealership_id: string | null
          doc_fee: number | null
          down_payment: number | null
          expires_at: string | null
          extended_warranty: number | null
          finance_amount: number | null
          freight_fee: number | null
          gap_insurance: number | null
          gst_rate: number | null
          hst_rate: number | null
          id: string
          interest_rate: number | null
          notes: string | null
          paint_protection: number | null
          payment_amount: number | null
          payment_frequency: string | null
          presented_at: string | null
          pst_rate: number | null
          quote_number: string
          status: string | null
          subtotal: number
          tax_amount: number | null
          term_months: number | null
          total_amount: number
          trade_in_value: number | null
          updated_at: string | null
          vehicle_id: string | null
          vehicle_price: number
        }
        Insert: {
          accessories?: Json | null
          admin_fee?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          dealer_fee?: number | null
          dealership_id?: string | null
          doc_fee?: number | null
          down_payment?: number | null
          expires_at?: string | null
          extended_warranty?: number | null
          finance_amount?: number | null
          freight_fee?: number | null
          gap_insurance?: number | null
          gst_rate?: number | null
          hst_rate?: number | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          paint_protection?: number | null
          payment_amount?: number | null
          payment_frequency?: string | null
          presented_at?: string | null
          pst_rate?: number | null
          quote_number: string
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          term_months?: number | null
          total_amount: number
          trade_in_value?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_price: number
        }
        Update: {
          accessories?: Json | null
          admin_fee?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          dealer_fee?: number | null
          dealership_id?: string | null
          doc_fee?: number | null
          down_payment?: number | null
          expires_at?: string | null
          extended_warranty?: number | null
          finance_amount?: number | null
          freight_fee?: number | null
          gap_insurance?: number | null
          gst_rate?: number | null
          hst_rate?: number | null
          id?: string
          interest_rate?: number | null
          notes?: string | null
          paint_protection?: number | null
          payment_amount?: number | null
          payment_frequency?: string | null
          presented_at?: string | null
          pst_rate?: number | null
          quote_number?: string
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          term_months?: number | null
          total_amount?: number
          trade_in_value?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          vehicle_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          access_log: Json | null
          blob_id: string | null
          created_at: string | null
          created_by: string | null
          download_count: number | null
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          max_downloads: number | null
          otp_required: boolean | null
          passcode_hash: string | null
          revoked_at: string | null
          share_token: string
        }
        Insert: {
          access_log?: Json | null
          blob_id?: string | null
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          max_downloads?: number | null
          otp_required?: boolean | null
          passcode_hash?: string | null
          revoked_at?: string | null
          share_token: string
        }
        Update: {
          access_log?: Json | null
          blob_id?: string | null
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          max_downloads?: number | null
          otp_required?: boolean | null
          passcode_hash?: string | null
          revoked_at?: string | null
          share_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_blob_id_fkey"
            columns: ["blob_id"]
            isOneToOne: false
            referencedRelation: "blobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          asking_price: number | null
          body_style: string | null
          condition: string | null
          cost: number | null
          created_at: string | null
          dealership_id: string | null
          documents: Json | null
          engine: string | null
          exterior_color: string | null
          external_id: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          images: Json | null
          interior_color: string | null
          location: string | null
          make: string
          mileage: number | null
          model: string
          msrp: number | null
          source: string | null
          status: string | null
          stock_number: string | null
          transmission: string | null
          trim: string | null
          updated_at: string | null
          vin: string | null
          year: number
        }
        Insert: {
          asking_price?: number | null
          body_style?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string | null
          dealership_id?: string | null
          documents?: Json | null
          engine?: string | null
          exterior_color?: string | null
          external_id?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          interior_color?: string | null
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          msrp?: number | null
          source?: string | null
          status?: string | null
          stock_number?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          asking_price?: number | null
          body_style?: string | null
          condition?: string | null
          cost?: number | null
          created_at?: string | null
          dealership_id?: string | null
          documents?: Json | null
          engine?: string | null
          exterior_color?: string | null
          external_id?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          images?: Json | null
          interior_color?: string | null
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          msrp?: number | null
          source?: string | null
          status?: string | null
          stock_number?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_dealership_id_fkey"
            columns: ["dealership_id"]
            isOneToOne: false
            referencedRelation: "dealerships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dealership_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_has_permission: {
        Args: { permission: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
