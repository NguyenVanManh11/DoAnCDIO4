import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const supabaseUrl = env['VITE_SUPABASE_URL']
const supabaseKey = env['VITE_SUPABASE_ANON_KEY']

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  const { data, error } = await supabase.from('voucher').select('*').limit(1)
  if (error) {
    console.error(error)
  } else {
    if (data.length > 0) {
      console.log("Columns:", Object.keys(data[0]))
      console.log("Data:", data[0])
    } else {
      console.log("No data, but table exists.")
      
    }
  }
}

checkSchema()
