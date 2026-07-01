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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_adjustments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          reason: string | null
          type: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          reason?: string | null
          type?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          reason?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_adjustments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assets: {
        Row: {
          asset_type: string
          campaign_id: string
          created_at: string
          file_size: number | null
          file_url: string
          id: string
          language: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          asset_type?: string
          campaign_id: string
          created_at?: string
          file_size?: number | null
          file_url: string
          id?: string
          language?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          asset_type?: string
          campaign_id?: string
          created_at?: string
          file_size?: number | null
          file_url?: string
          id?: string
          language?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_attributions: {
        Row: {
          campaign_name: string
          contact_id: string | null
          converted_to_opportunity: boolean | null
          created_at: string
          engagement_level: string | null
          id: string
        }
        Insert: {
          campaign_name: string
          contact_id?: string | null
          converted_to_opportunity?: boolean | null
          created_at?: string
          engagement_level?: string | null
          id?: string
        }
        Update: {
          campaign_name?: string
          contact_id?: string | null
          converted_to_opportunity?: boolean | null
          created_at?: string
          engagement_level?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_attributions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_audiences: {
        Row: {
          campaign_id: string
          company_name: string | null
          contact_id: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          job_title: string | null
          name: string
        }
        Insert: {
          campaign_id: string
          company_name?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          name: string
        }
        Update: {
          campaign_id?: string
          company_name?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_audiences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_audiences_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_metrics: {
        Row: {
          ad_spend: number | null
          campaign_id: string
          click_through_rate: number | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          cost_per_lead: number | null
          created_at: string
          date: string
          emails_sent: number | null
          engagement: number | null
          id: string
          impressions: number | null
          leads_generated: number | null
          open_rate: number | null
          reach: number | null
          replies: number | null
          traffic: number | null
        }
        Insert: {
          ad_spend?: number | null
          campaign_id: string
          click_through_rate?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost_per_lead?: number | null
          created_at?: string
          date?: string
          emails_sent?: number | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          open_rate?: number | null
          reach?: number | null
          replies?: number | null
          traffic?: number | null
        }
        Update: {
          ad_spend?: number | null
          campaign_id?: string
          click_through_rate?: number | null
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          cost_per_lead?: number | null
          created_at?: string
          date?: string
          emails_sent?: number | null
          engagement?: number | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          open_rate?: number | null
          reach?: number | null
          replies?: number | null
          traffic?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_requests: {
        Row: {
          budget_range: string | null
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          objective: string
          status: Database["public"]["Enums"]["campaign_request_status"]
          target_audience: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          objective: string
          status?: Database["public"]["Enums"]["campaign_request_status"]
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          objective?: string
          status?: Database["public"]["Enums"]["campaign_request_status"]
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brief: Json | null
          budget: number | null
          cadence_end_at: string | null
          cadence_interval: number
          cadence_max_runs: number | null
          cadence_type: string
          cadence_unit: string
          campaign_kind: string | null
          company_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          goal: string | null
          id: string
          language: string | null
          last_run_at: string | null
          lead_form_config: Json | null
          lead_form_published: boolean
          name: string
          next_run_at: string | null
          objective: string | null
          output_language: string
          owner_id: string | null
          pack: Json | null
          refresh_strategy: string
          runs_completed: number
          slug: string | null
          start_at: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience_description: string | null
          target_country: string | null
          timezone: string
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          brief?: Json | null
          budget?: number | null
          cadence_end_at?: string | null
          cadence_interval?: number
          cadence_max_runs?: number | null
          cadence_type?: string
          cadence_unit?: string
          campaign_kind?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          language?: string | null
          last_run_at?: string | null
          lead_form_config?: Json | null
          lead_form_published?: boolean
          name: string
          next_run_at?: string | null
          objective?: string | null
          output_language?: string
          owner_id?: string | null
          pack?: Json | null
          refresh_strategy?: string
          runs_completed?: number
          slug?: string | null
          start_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience_description?: string | null
          target_country?: string | null
          timezone?: string
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          brief?: Json | null
          budget?: number | null
          cadence_end_at?: string | null
          cadence_interval?: number
          cadence_max_runs?: number | null
          cadence_type?: string
          cadence_unit?: string
          campaign_kind?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          language?: string | null
          last_run_at?: string | null
          lead_form_config?: Json | null
          lead_form_published?: boolean
          name?: string
          next_run_at?: string | null
          objective?: string | null
          output_language?: string
          owner_id?: string | null
          pack?: Json | null
          refresh_strategy?: string
          runs_completed?: number
          slug?: string | null
          start_at?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience_description?: string | null
          target_country?: string | null
          timezone?: string
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          company_id: string
          created_at: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          agency_size: string | null
          business_description: string | null
          company_id: string
          competitors: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          existing_channels: string | null
          id: string
          industries_served: string | null
          marketing_goals: string | null
          services_offered: string | null
          target_audience: string | null
          target_regions: string | null
          updated_at: string
        }
        Insert: {
          agency_size?: string | null
          business_description?: string | null
          company_id: string
          competitors?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          existing_channels?: string | null
          id?: string
          industries_served?: string | null
          marketing_goals?: string | null
          services_offered?: string | null
          target_audience?: string | null
          target_regions?: string | null
          updated_at?: string
        }
        Update: {
          agency_size?: string | null
          business_description?: string | null
          company_id?: string
          competitors?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          existing_channels?: string | null
          id?: string
          industries_served?: string | null
          marketing_goals?: string | null
          services_offered?: string | null
          target_audience?: string | null
          target_regions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      client_workspaces: {
        Row: {
          agency_company_id: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          default_country: string | null
          default_language: string
          default_locale: string | null
          default_timezone: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          agency_company_id: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_country?: string | null
          default_language?: string
          default_locale?: string | null
          default_timezone?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          agency_company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          default_country?: string | null
          default_language?: string
          default_locale?: string | null
          default_timezone?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_workspaces_agency_company_id_fkey"
            columns: ["agency_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          account_type: string
          company_size: string | null
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          language: string | null
          name: string
          region: string | null
          source_upload_id: string | null
          status: Database["public"]["Enums"]["company_status"]
          updated_at: string
          website: string | null
          workspace_id: string | null
        }
        Insert: {
          account_type?: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          name: string
          region?: string | null
          source_upload_id?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          website?: string | null
          workspace_id?: string | null
        }
        Update: {
          account_type?: string
          company_size?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          name?: string
          region?: string | null
          source_upload_id?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          updated_at?: string
          website?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "data_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          blocked: boolean
          company_id: string | null
          country: string | null
          created_at: string
          created_by: string | null
          decision_maker_level: string | null
          duplicate_flag: boolean
          email: string | null
          first_name: string
          id: string
          job_title: string | null
          language: string | null
          last_contacted_at: string | null
          last_interaction_at: string | null
          last_name: string
          last_verified_at: string | null
          linkedin_url: string | null
          phone: string | null
          quality_status: string | null
          source_upload_id: string | null
          suppressed: boolean
          timezone: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          blocked?: boolean
          company_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          decision_maker_level?: string | null
          duplicate_flag?: boolean
          email?: string | null
          first_name: string
          id?: string
          job_title?: string | null
          language?: string | null
          last_contacted_at?: string | null
          last_interaction_at?: string | null
          last_name: string
          last_verified_at?: string | null
          linkedin_url?: string | null
          phone?: string | null
          quality_status?: string | null
          source_upload_id?: string | null
          suppressed?: boolean
          timezone?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          blocked?: boolean
          company_id?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          decision_maker_level?: string | null
          duplicate_flag?: boolean
          email?: string | null
          first_name?: string
          id?: string
          job_title?: string | null
          language?: string | null
          last_contacted_at?: string | null
          last_interaction_at?: string | null
          last_name?: string
          last_verified_at?: string | null
          linkedin_url?: string | null
          phone?: string | null
          quality_status?: string | null
          source_upload_id?: string | null
          suppressed?: boolean
          timezone?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_source_upload_id_fkey"
            columns: ["source_upload_id"]
            isOneToOne: false
            referencedRelation: "data_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          created_at: string
          delta: number
          id: string
          meta: Json | null
          reason: string
          ref_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          meta?: Json | null
          reason: string
          ref_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          meta?: Json | null
          reason?: string
          ref_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_topups: {
        Row: {
          amount: number
          created_at: string
          credits: number
          id: string
          pack: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits: number
          id?: string
          pack: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits?: number
          id?: string
          pack?: string
          user_id?: string
        }
        Relationships: []
      }
      data_upload_mappings: {
        Row: {
          created_at: string
          destination_field: string | null
          id: string
          ignored: boolean
          owner_id: string
          source_column: string
          upload_id: string
        }
        Insert: {
          created_at?: string
          destination_field?: string | null
          id?: string
          ignored?: boolean
          owner_id?: string
          source_column: string
          upload_id: string
        }
        Update: {
          created_at?: string
          destination_field?: string | null
          id?: string
          ignored?: boolean
          owner_id?: string
          source_column?: string
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_upload_mappings_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "data_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      data_upload_rows: {
        Row: {
          created_at: string
          duplicate_of_contact_id: string | null
          duplicate_status: string
          id: string
          import_status: string
          imported_contact_id: string | null
          issues: Json
          mapped_fields: Json
          owner_id: string
          raw_fields: Json
          row_number: number
          upload_id: string
          validation_status: string
        }
        Insert: {
          created_at?: string
          duplicate_of_contact_id?: string | null
          duplicate_status?: string
          id?: string
          import_status?: string
          imported_contact_id?: string | null
          issues?: Json
          mapped_fields?: Json
          owner_id?: string
          raw_fields?: Json
          row_number: number
          upload_id: string
          validation_status?: string
        }
        Update: {
          created_at?: string
          duplicate_of_contact_id?: string | null
          duplicate_status?: string
          id?: string
          import_status?: string
          imported_contact_id?: string | null
          issues?: Json
          mapped_fields?: Json
          owner_id?: string
          raw_fields?: Json
          row_number?: number
          upload_id?: string
          validation_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_upload_rows_duplicate_of_contact_id_fkey"
            columns: ["duplicate_of_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_upload_rows_imported_contact_id_fkey"
            columns: ["imported_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_upload_rows_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "data_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      data_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_type: string
          id: string
          owner_id: string
          row_count: number
          source_path: string | null
          status: string
          summary: Json
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type?: string
          id?: string
          owner_id?: string
          row_count?: number
          source_path?: string | null
          status?: string
          summary?: Json
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string
          id?: string
          owner_id?: string
          row_count?: number
          source_path?: string | null
          status?: string
          summary?: Json
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_uploads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_connection_secrets: {
        Row: {
          connection_id: string
          created_at: string
          encrypted_password: string
          updated_at: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          encrypted_password: string
          updated_at?: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          encrypted_password?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_connection_secrets_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "email_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      email_connections: {
        Row: {
          created_at: string
          display_name: string | null
          dkim_status: string | null
          domain_verification_details: Json | null
          domain_verified_at: string | null
          from_email: string
          from_name: string | null
          id: string
          is_default: boolean
          last_error: string | null
          last_verified_at: string | null
          provider: string
          rate_limit_per_hour: number
          smtp_host: string
          smtp_port: number
          smtp_username: string
          spf_status: string | null
          status: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          dkim_status?: string | null
          domain_verification_details?: Json | null
          domain_verified_at?: string | null
          from_email: string
          from_name?: string | null
          id?: string
          is_default?: boolean
          last_error?: string | null
          last_verified_at?: string | null
          provider: string
          rate_limit_per_hour?: number
          smtp_host: string
          smtp_port?: number
          smtp_username: string
          spf_status?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          dkim_status?: string | null
          domain_verification_details?: Json | null
          domain_verified_at?: string | null
          from_email?: string
          from_name?: string | null
          id?: string
          is_default?: boolean
          last_error?: string | null
          last_verified_at?: string | null
          provider?: string
          rate_limit_per_hour?: number
          smtp_host?: string
          smtp_port?: number
          smtp_username?: string
          spf_status?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sends: {
        Row: {
          body: string
          campaign_id: string | null
          connection_id: string | null
          created_at: string
          error: string | null
          id: string
          lead_id: string | null
          recipient_email: string
          recipient_name: string | null
          scheduled_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          sequence_step: number | null
          status: string
          subject: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          body: string
          campaign_id?: string | null
          connection_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string | null
          recipient_email: string
          recipient_name?: string | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_step?: number | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          body?: string
          campaign_id?: string | null
          connection_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          lead_id?: string | null
          recipient_email?: string
          recipient_name?: string | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sequence_step?: number | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "email_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          category: string
          created_at: string
          details: string | null
          id: string
          message: string
          resolved: boolean
          severity: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string | null
          id?: string
          message: string
          resolved?: boolean
          severity?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string | null
          id?: string
          message?: string
          resolved?: boolean
          severity?: string
        }
        Relationships: []
      }
      human_reviews: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          delivered_at: string | null
          id: string
          notes: string | null
          purchased_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          purchased_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          notes?: string | null
          purchased_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_reviews_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string | null
          due_date: string | null
          file_url: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          lead_id: string | null
          opportunity_id: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_audit_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_audit_log_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          campaign_id: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          follow_up_at: string | null
          follow_up_state: Database["public"]["Enums"]["lead_follow_state"]
          id: string
          last_action: string | null
          last_contacted_at: string | null
          last_email_sent_at: string | null
          last_email_subject: string | null
          last_interaction_at: string | null
          marketing_interest: string | null
          name: string | null
          opportunity_id: string | null
          owner_id: string | null
          phone: string | null
          replied_at: string | null
          snoozed_until: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_at?: string | null
          follow_up_state?: Database["public"]["Enums"]["lead_follow_state"]
          id?: string
          last_action?: string | null
          last_contacted_at?: string | null
          last_email_sent_at?: string | null
          last_email_subject?: string | null
          last_interaction_at?: string | null
          marketing_interest?: string | null
          name?: string | null
          opportunity_id?: string | null
          owner_id?: string | null
          phone?: string | null
          replied_at?: string | null
          snoozed_until?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          follow_up_at?: string | null
          follow_up_state?: Database["public"]["Enums"]["lead_follow_state"]
          id?: string
          last_action?: string | null
          last_contacted_at?: string | null
          last_email_sent_at?: string | null
          last_email_subject?: string | null
          last_interaction_at?: string | null
          marketing_interest?: string | null
          name?: string | null
          opportunity_id?: string | null
          owner_id?: string | null
          phone?: string | null
          replied_at?: string | null
          snoozed_until?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_acceptances: {
        Row: {
          accepted_at: string
          accepted_aup_version: string | null
          accepted_cookie_policy_version: string | null
          accepted_customer_agreement_version: string | null
          accepted_dpa_version: string | null
          accepted_marketing_compliance_version: string | null
          accepted_privacy_version: string | null
          accepted_security_policy_version: string | null
          accepted_sla_version: string | null
          accepted_terms_version: string | null
          account_type: string | null
          created_at: string
          document_versions: Json | null
          email: string | null
          id: string
          ip_address: string | null
          legal_version: string | null
          source: string | null
          user_agent: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          accepted_at?: string
          accepted_aup_version?: string | null
          accepted_cookie_policy_version?: string | null
          accepted_customer_agreement_version?: string | null
          accepted_dpa_version?: string | null
          accepted_marketing_compliance_version?: string | null
          accepted_privacy_version?: string | null
          accepted_security_policy_version?: string | null
          accepted_sla_version?: string | null
          accepted_terms_version?: string | null
          account_type?: string | null
          created_at?: string
          document_versions?: Json | null
          email?: string | null
          id?: string
          ip_address?: string | null
          legal_version?: string | null
          source?: string | null
          user_agent?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          accepted_at?: string
          accepted_aup_version?: string | null
          accepted_cookie_policy_version?: string | null
          accepted_customer_agreement_version?: string | null
          accepted_dpa_version?: string | null
          accepted_marketing_compliance_version?: string | null
          accepted_privacy_version?: string | null
          accepted_security_policy_version?: string | null
          accepted_sla_version?: string | null
          accepted_terms_version?: string | null
          account_type?: string | null
          created_at?: string
          document_versions?: Json | null
          email?: string | null
          id?: string
          ip_address?: string | null
          legal_version?: string | null
          source?: string | null
          user_agent?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          company_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_from_client: boolean
          read: boolean
          sender_id: string
        }
        Insert: {
          company_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_from_client?: boolean
          read?: boolean
          sender_id: string
        }
        Update: {
          company_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_from_client?: boolean
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          last_interaction_at: string | null
          next_action_at: string | null
          notes: string | null
          owner_id: string | null
          probability: number | null
          reason_lost: string | null
          service: string | null
          source_campaign_id: string | null
          source_lead_id: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          stage_changed_at: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_interaction_at?: string | null
          next_action_at?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          reason_lost?: string | null
          service?: string | null
          source_campaign_id?: string | null
          source_lead_id?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          stage_changed_at?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_interaction_at?: string | null
          next_action_at?: string | null
          notes?: string | null
          owner_id?: string | null
          probability?: number | null
          reason_lost?: string | null
          service?: string | null
          source_campaign_id?: string | null
          source_lead_id?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          stage_changed_at?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          created_at: string
          currency: string
          environment: string
          id: string
          meta: Json | null
          price_id: string
          product_kind: string
          ref_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          meta?: Json | null
          price_id: string
          product_kind: string
          ref_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          environment?: string
          id?: string
          meta?: Json | null
          price_id?: string
          product_kind?: string
          ref_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          status: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          status?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          billing_country: string | null
          company_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_currency: string
          preferred_language: string
          preferred_locale: string | null
          preferred_timezone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          billing_country?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_currency?: string
          preferred_language?: string
          preferred_locale?: string | null
          preferred_timezone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          billing_country?: string | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_currency?: string
          preferred_language?: string
          preferred_locale?: string | null
          preferred_timezone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_test_results: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          last_run_at: string | null
          notes: string | null
          run_by: string | null
          status: string
          test_name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          last_run_at?: string | null
          notes?: string | null
          run_by?: string | null
          status?: string
          test_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_run_at?: string | null
          notes?: string | null
          run_by?: string | null
          status?: string
          test_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      send_audit_log: {
        Row: {
          action: string
          campaign_id: string | null
          created_at: string
          details: Json
          id: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          action: string
          campaign_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          action?: string
          campaign_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          plan: string | null
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan?: string | null
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "client_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          monthly_price: number
          plan_name: string
          renewal_date: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          monthly_price?: number
          plan_name?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          monthly_price?: number
          plan_name?: string
          renewal_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          billing_country: string | null
          created_at: string
          currency: string
          id: string
          period_end: string | null
          period_start: string
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_country?: string | null
          created_at?: string
          currency?: string
          id?: string
          period_end?: string | null
          period_start?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_country?: string | null
          created_at?: string
          currency?: string
          id?: string
          period_end?: string | null
          period_start?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      agency_pooled_sends_today: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      provision_first_workspace: {
        Args: {
          _country?: string
          _industry?: string
          _name: string
          _website?: string
        }
        Returns: {
          agency_company_id: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          default_country: string | null
          default_language: string
          default_locale: string | null
          default_timezone: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string
          website: string | null
        }
        SetofOptions: {
          from: "*"
          to: "client_workspaces"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      provision_qa_workspace: { Args: never; Returns: string }
      provision_starter_plan: {
        Args: never
        Returns: {
          billing_country: string | null
          created_at: string
          currency: string
          id: string
          period_end: string | null
          period_start: string
          plan: string
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reset_qa_workspace: { Args: never; Returns: boolean }
    }
    Enums: {
      activity_type:
        | "email"
        | "call"
        | "meeting"
        | "note"
        | "campaign_interaction"
      app_role: "admin" | "sales" | "marketing" | "founder" | "client"
      campaign_request_status: "pending" | "reviewed" | "approved" | "rejected"
      campaign_status:
        | "active"
        | "scheduled"
        | "completed"
        | "paused"
        | "draft"
        | "expired"
      campaign_type:
        | "email"
        | "social_media"
        | "paid_advertising"
        | "influencer"
        | "pr"
        | "linkedin_outreach"
        | "newsletter"
      company_status: "prospect" | "active_client" | "past_client"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      lead_follow_state:
        | "none"
        | "due"
        | "overdue"
        | "replied"
        | "warm"
        | "dormant"
        | "bounced"
        | "suppressed"
        | "snoozed"
        | "in_pipeline"
        | "won"
        | "lost"
      lead_status:
        | "new"
        | "contacted"
        | "demo_scheduled"
        | "proposal_sent"
        | "closed_won"
        | "closed_lost"
      opportunity_stage:
        | "discovery"
        | "demo"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      task_status: "pending" | "in_progress" | "completed"
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
      activity_type: [
        "email",
        "call",
        "meeting",
        "note",
        "campaign_interaction",
      ],
      app_role: ["admin", "sales", "marketing", "founder", "client"],
      campaign_request_status: ["pending", "reviewed", "approved", "rejected"],
      campaign_status: [
        "active",
        "scheduled",
        "completed",
        "paused",
        "draft",
        "expired",
      ],
      campaign_type: [
        "email",
        "social_media",
        "paid_advertising",
        "influencer",
        "pr",
        "linkedin_outreach",
        "newsletter",
      ],
      company_status: ["prospect", "active_client", "past_client"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      lead_follow_state: [
        "none",
        "due",
        "overdue",
        "replied",
        "warm",
        "dormant",
        "bounced",
        "suppressed",
        "snoozed",
        "in_pipeline",
        "won",
        "lost",
      ],
      lead_status: [
        "new",
        "contacted",
        "demo_scheduled",
        "proposal_sent",
        "closed_won",
        "closed_lost",
      ],
      opportunity_stage: [
        "discovery",
        "demo",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      task_status: ["pending", "in_progress", "completed"],
    },
  },
} as const
