import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type ToolType = 'mockup' | 'banner' | 'privacy' | 'icon';

export interface UserProject {
  id: string;
  user_id: string;
  name: string;
  tool_type: ToolType;
  data: Record<string, unknown>;
  preview_image_url?: string | null;
  created_at: string;
  updated_at: string;
}
