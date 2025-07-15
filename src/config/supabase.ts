import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttqahrjujapdduubxlvd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cWFocmp1amFwZGR1dWJ4bHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTYxOTYsImV4cCI6MjA2NjM3MjE5Nn0.Mt1t-CvotUR0M0LZCNF-lp2ql578B0X1rASGoCxk3to'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan_type: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      ads: {
        Row: {
          id: number
          library_id: string
          title: string
          description: string | null
          advertiser_name: string
          page_name: string | null
          video_url: string | null
          thumbnail_url: string | null
          uses_count: number
          start_date: string | null
          end_date: string | null
          is_active: boolean
          is_favorite: boolean
          category: string | null
          country: string
          language: string
          page_url: string | null
          ad_url: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          library_id: string
          title: string
          description?: string | null
          advertiser_name: string
          page_name?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          uses_count?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          is_favorite?: boolean
          category?: string | null
          country?: string
          language?: string
          page_url?: string | null
          ad_url?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          library_id?: string
          title?: string
          description?: string | null
          advertiser_name?: string
          page_name?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          uses_count?: number
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          is_favorite?: boolean
          category?: string | null
          country?: string
          language?: string
          page_url?: string | null
          ad_url?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          color: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          color?: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          color?: string
          user_id?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          name: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          user_id?: string | null
          created_at?: string
        }
      }
    }
  }
} 