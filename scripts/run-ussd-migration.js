const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runMigration() {
  try {
    console.log('Running USSD code migration...')
    
    // Check if the column already exists
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'nominees' })
    
    if (columnError) {
      console.log('Could not check columns, proceeding with migration...')
    } else {
      console.log('Available columns:', columns)
      if (columns && columns.includes('ussd_code')) {
        console.log('USSD code column already exists, skipping migration')
        return
      }
    }

    // Add the ussd_code column
    const { error: alterError } = await supabase
      .rpc('exec_sql', {
        sql: `
          ALTER TABLE nominees 
          ADD COLUMN IF NOT EXISTS ussd_code VARCHAR(4) UNIQUE;
          
          CREATE INDEX IF NOT EXISTS idx_nominees_ussd_code ON nominees(ussd_code);
          
          COMMENT ON COLUMN nominees.ussd_code IS 'Unique 4-digit USSD code for direct voting via mobile';
        `
      })

    if (alterError) {
      console.error('Error adding USSD code column:', alterError)
      return
    }

    console.log('USSD code column added successfully!')

    // Generate USSD codes for existing nominees
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('id, name')
      .is('ussd_code', null)

    if (nomineesError) {
      console.error('Error fetching nominees:', nomineesError)
      return
    }

    if (nominees && nominees.length > 0) {
      console.log(`Generating USSD codes for ${nominees.length} existing nominees...`)
      
      for (const nominee of nominees) {
        // Generate a unique 4-digit code
        let code
        let isUnique = false
        let attempts = 0
        
        while (!isUnique && attempts < 100) {
          code = Math.floor(Math.random() * 9000) + 1000
          
          // Check if code is unique
          const { data: existing } = await supabase
            .from('nominees')
            .select('id')
            .eq('ussd_code', code.toString())
            .single()
          
          if (!existing) {
            isUnique = true
          }
          attempts++
        }
        
        if (isUnique) {
          const { error: updateError } = await supabase
            .from('nominees')
            .update({ ussd_code: code.toString() })
            .eq('id', nominee.id)
          
          if (updateError) {
            console.error(`Error updating nominee ${nominee.name}:`, updateError)
          } else {
            console.log(`Assigned USSD code ${code} to ${nominee.name}`)
          }
        } else {
          console.error(`Could not generate unique code for ${nominee.name}`)
        }
      }
    }

    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration()
