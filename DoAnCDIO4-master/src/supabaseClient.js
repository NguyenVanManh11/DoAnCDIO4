import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'CẢNH BÁO: Supabase URL hoặc Anon Key chưa được cấu hình trong file .env. Hệ thống sẽ chạy ở chế độ Demo (Mock Data).'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://vxnvyaxftkrpoozgevlg.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bnZ5YXhmdGtycG9vemdldmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MjkyNTgsImV4cCI6MjA5ODIwNTI1OH0.q2OaO0FUg6tFvxOaGUWsTP7voQ28hlyiFx3uNIFKwE8'
)
