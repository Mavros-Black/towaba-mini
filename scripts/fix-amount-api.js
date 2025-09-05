// Simple script to fix campaign amount via API
// Run this in your browser console on the campaign edit page

async function fixCampaignAmount() {
  const campaignId = '738d82f6-7594-460d-82e3-162c0e255400';
  
  try {
    const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
      },
      body: JSON.stringify({
        amountPerVote: 100 // This will be converted to 100 pesewas (1 GHS)
      })
    });
    
    if (response.ok) {
      console.log('Campaign amount fixed successfully!');
    } else {
      console.error('Failed to fix campaign amount');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the fix
fixCampaignAmount();
