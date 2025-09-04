import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Nalo USSD API Configuration
const NALO_API_BASE = 'https://api.nalosolutions.com'
const NALO_API_KEY = process.env.NALO_API_KEY
const NALO_USSD_CODE = process.env.NALO_USSD_CODE || '*920*123#'

interface USSDRequest {
  sessionId: string
  msisdn: string
  userInput: string
  network: string
  serviceCode: string
}

interface USSDResponse {
  sessionId: string
  message: string
  continueSession: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: USSDRequest = await request.json()
    const { sessionId, msisdn, userInput, network, serviceCode } = body

    console.log('Nalo USSD Request:', { sessionId, msisdn, userInput, network, serviceCode })

    // Handle different stages of USSD interaction
    let response: USSDResponse

    if (!userInput || userInput === '') {
      // Initial menu - show voting options
      response = await showVotingMenu(sessionId)
    } else {
      // Process user input
      response = await processUserInput(sessionId, msisdn, userInput, network)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Nalo USSD Error:', error)
    return NextResponse.json({
      sessionId: 'error',
      message: 'An error occurred. Please try again later.',
      continueSession: false
    }, { status: 500 })
  }
}

async function showVotingMenu(sessionId: string): Promise<USSDResponse> {
  const menu = `Welcome to Towaba Voting Platform

1. Vote for Campaign
2. Check Campaign Status
3. View Results
4. Help

Enter your choice (1-4):`

  return {
    sessionId,
    message: menu,
    continueSession: true
  }
}

async function processUserInput(
  sessionId: string, 
  msisdn: string, 
  userInput: string, 
  network: string
): Promise<USSDResponse> {
  
  const input = userInput.trim()
  
  // Check if this is a campaign selection
  if (input.match(/^\d+$/)) {
    const choice = parseInt(input)
    
    switch (choice) {
      case 1:
        return await showCampaigns(sessionId)
      case 2:
        return await showCampaignStatus(sessionId, msisdn)
      case 3:
        return await showResults(sessionId)
      case 4:
        return await showHelp(sessionId)
      default:
        return {
          sessionId,
          message: 'Invalid choice. Please enter 1-4:',
          continueSession: true
        }
    }
  }
  
  // Check if this is a campaign ID selection
  if (input.startsWith('C')) {
    const campaignId = input.substring(1)
    return await showNominees(sessionId, campaignId)
  }
  
  // Check if this is a nominee selection with payment
  if (input.includes('*')) {
    const [nomineeId, amount] = input.split('*')
    return await initiatePayment(sessionId, msisdn, nomineeId, amount, network)
  }
  
  return {
    sessionId,
    message: 'Invalid input. Please try again.',
    continueSession: true
  }
}

async function showCampaigns(sessionId: string): Promise<USSDResponse> {
  try {
    // Fetch active campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, title, amount_per_vote')
      .eq('status', 'ACTIVE')
      .eq('is_public', true)
      .limit(10)

    if (error || !campaigns || campaigns.length === 0) {
      return {
        sessionId,
        message: 'No active campaigns found. Thank you for using Towaba.',
        continueSession: false
      }
    }

    let menu = 'Active Campaigns:\n\n'
    campaigns.forEach((campaign, index) => {
      menu += `${index + 1}. ${campaign.title} (${campaign.amount_per_vote} GHS per vote)\n`
    })
    
    menu += '\nEnter campaign number (1-' + campaigns.length + '):'

    return {
      sessionId,
      message: menu,
      continueSession: true
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      sessionId,
      message: 'Error loading campaigns. Please try again later.',
      continueSession: false
    }
  }
}

async function showNominees(sessionId: string, campaignId: string): Promise<USSDResponse> {
  try {
    // Fetch nominees for the campaign
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('id, name, description')
      .eq('campaign_id', campaignId)
      .eq('is_evicted', false)
      .limit(10)

    if (error || !nominees || nominees.length === 0) {
      return {
        sessionId,
        message: 'No nominees found for this campaign.',
        continueSession: false
      }
    }

    let menu = 'Nominees:\n\n'
    nominees.forEach((nominee, index) => {
      menu += `${index + 1}. ${nominee.name}\n`
    })
    
    menu += '\nEnter nominee number to vote:'

    return {
      sessionId,
      message: menu,
      continueSession: true
    }
  } catch (error) {
    console.error('Error fetching nominees:', error)
    return {
      sessionId,
      message: 'Error loading nominees. Please try again later.',
      continueSession: false
    }
  }
}

async function initiatePayment(
  sessionId: string, 
  msisdn: string, 
  nomineeId: string, 
  amount: string, 
  network: string
): Promise<USSDResponse> {
  try {
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        reference: `NALO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: parseInt(amount) * 100, // Convert to pesewas
        method: 'NALO_USSD',
        status: 'PENDING',
        voter_name: `USSD-${msisdn}`,
        metadata: {
          sessionId,
          msisdn,
          network,
          nomineeId,
          isAnonymous: true
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return {
        sessionId,
        message: 'Payment initialization failed. Please try again.',
        continueSession: false
      }
    }

    // Create vote record
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        nominee_id: nomineeId,
        amount: parseInt(amount) * 100,
        payment_id: payment.id,
        status: 'PENDING',
        voter_name: `USSD-${msisdn}`,
        reference: payment.reference
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote creation error:', voteError)
      return {
        sessionId,
        message: 'Vote creation failed. Please try again.',
        continueSession: false
      }
    }

    const message = `Payment initiated successfully!

Reference: ${payment.reference}
Amount: ${amount} GHS
Nominee: ${nomineeId}

You will receive a mobile money prompt shortly.
Thank you for voting with Towaba!`

    return {
      sessionId,
      message,
      continueSession: false
    }
  } catch (error) {
    console.error('Payment initiation error:', error)
    return {
      sessionId,
      message: 'Payment failed. Please try again later.',
      continueSession: false
    }
  }
}

async function showCampaignStatus(sessionId: string, msisdn: string): Promise<USSDResponse> {
  // Implementation for checking campaign status
  return {
    sessionId,
    message: 'Campaign status feature coming soon!',
    continueSession: false
  }
}

async function showResults(sessionId: string): Promise<USSDResponse> {
  // Implementation for showing results
  return {
    sessionId,
    message: 'Results feature coming soon!',
    continueSession: false
  }
}

async function showHelp(sessionId: string): Promise<USSDResponse> {
  const helpText = `Towaba Voting Platform Help:

1. Dial ${NALO_USSD_CODE}
2. Select "Vote for Campaign"
3. Choose your preferred campaign
4. Select nominee to vote for
5. Confirm payment via mobile money

For support, contact: support@towaba.com
Thank you for using Towaba!`

  return {
    sessionId,
    message: helpText,
    continueSession: false
  }
}
