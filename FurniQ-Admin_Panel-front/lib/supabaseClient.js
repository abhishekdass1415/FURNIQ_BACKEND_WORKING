import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cekaxlsuemkcqgzgiigw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNla2F4bHN1ZW1rY3FnemdpaWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NTEyNTUsImV4cCI6MjA3MjAyNzI1NX0.H3Kt29bLSKuvLgXLqCCAaucrQXmKzVdVkF_-rXp5zv0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//Furniq-project
//Furniq123@#