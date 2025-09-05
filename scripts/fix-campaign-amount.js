const { createClient } = require('@supabase/supabase-js')

// You'll need to replace these with your actual values
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_SERVICE_ROLE_KEY'
)

async function fixCampaignAmount() {
  try {
    console.log('Fixing campaign amount...')
    
    // Get the campaign that has the wrong amount
    const { data: campaigns, error: fetchError } = await supabase
      .from('campaigns')
      .select('id, title, amount_per_vote')
      .eq('id', '738d82f6-7594-460d-82e3-162c0e255400')
    
    if (fetchError) {
      console.error('Error fetching campaign:', fetchError)
      return
    }
    
    if (campaigns && campaigns.length > 0) {
      const campaign = campaigns[0]
      console.log('Current campaign data:', campaign)
      
      // Fix the amount (10000 pesewas = 100 GHS, should be 100 pesewas = 1 GHS)
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ amount_per_vote: 100 }) // Set to 1 GHS (100 pesewas)
        .eq('id', campaign.id)
      
      if (updateError) {
        console.error('Error updating campaign:', updateError)
      } else {
        console.log('Campaign amount fixed successfully!')
        console.log('Changed from 10000 pesewas (100 GHS) to 100 pesewas (1 GHS)')
      }
    } else {
      console.log('Campaign not found')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixCampaignAmount()
