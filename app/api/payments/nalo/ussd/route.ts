import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Extend global type for USSD sessions
declare global {
  var ussdSessions: Record<string, any> | undefined
}

// Create Supabase client only if environment variables are available
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

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
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    )
  }
  
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
  
  // Check if this is a menu choice
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
  
  // Check if this is a campaign selection (number)
  if (input.match(/^\d+$/) && !input.match(/^[1-4]$/)) {
    return await processCampaignSelection(sessionId, msisdn, input, network)
  }
  
  // Check if this is a nominee selection (number)
  if (input.match(/^\d+$/) && global.ussdSessions?.[sessionId]?.step === 'nominee_selection') {
    return await processNomineeSelection(sessionId, msisdn, input, network)
  }
  
  // Check if this is a payment confirmation
  if (input.toUpperCase() === 'Y' || input.toUpperCase() === 'YES') {
    return await confirmPayment(sessionId, msisdn, network)
  }
  
  // Check if this is a payment cancellation
  if (input.toUpperCase() === 'N' || input.toUpperCase() === 'NO') {
    return {
      sessionId,
      message: 'Payment cancelled. Thank you for using Towaba!',
      continueSession: false
    }
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
  if (!supabase) {
    return {
      sessionId,
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    }
  }
  
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

    // Store campaigns in session for selection
    global.ussdSessions = global.ussdSessions || {}
    global.ussdSessions[sessionId] = {
      step: 'campaign_selection',
      campaigns: campaigns
    }

    let menu = 'Active Campaigns:\n\n'
    campaigns.forEach((campaign, index) => {
      const amount = (campaign.amount_per_vote / 100).toFixed(2)
      menu += `${index + 1}. ${campaign.title} (${amount} GHS per vote)\n`
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
  if (!supabase) {
    return {
      sessionId,
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    }
  }
  
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
  if (!supabase) {
    return {
      sessionId,
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    }
  }
  
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

1. Dial *920*123#
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

// This function is not used in the traditional menu flow
// Keeping it for potential future use
async function processUSSDCode(
  sessionId: string, 
  msisdn: string, 
  ussdCode: string, 
  network: string
): Promise<USSDResponse> {
  return {
    sessionId,
    message: 'Direct USSD code voting is not available. Please use the menu system.',
    continueSession: true
  }
}

async function processCampaignSelection(
  sessionId: string, 
  msisdn: string, 
  input: string, 
  network: string
): Promise<USSDResponse> {
  if (!supabase) {
    return {
      sessionId,
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    }
  }

  try {
    const sessionData = global.ussdSessions?.[sessionId]
    if (!sessionData || sessionData.step !== 'campaign_selection') {
      return {
        sessionId,
        message: 'Session expired. Please start over.',
        continueSession: true
      }
    }

    const campaignIndex = parseInt(input) - 1
    const campaigns = sessionData.campaigns

    if (campaignIndex < 0 || campaignIndex >= campaigns.length) {
      return {
        sessionId,
        message: `Invalid selection. Please enter 1-${campaigns.length}:`,
        continueSession: true
      }
    }

    const selectedCampaign = campaigns[campaignIndex]

    // Fetch nominees for this campaign
    const { data: nominees, error } = await supabase
      .from('nominees')
      .select('id, name, bio, ussd_code')
      .eq('campaign_id', selectedCampaign.id)
      .limit(10)

    if (error || !nominees || nominees.length === 0) {
      return {
        sessionId,
        message: 'No nominees found for this campaign. Please try another campaign.',
        continueSession: true
      }
    }

    // Update session with selected campaign and nominees
    if (!global.ussdSessions) {
      global.ussdSessions = {}
    }
    global.ussdSessions[sessionId] = {
      ...sessionData,
      step: 'nominee_selection',
      selectedCampaign,
      nominees
    }

    let message = `Nominees for ${selectedCampaign.title}:\n\n`
    nominees.forEach((nominee, index) => {
      message += `${index + 1}. ${nominee.name}\n`
      if (nominee.bio) {
        message += `   ${nominee.bio.substring(0, 30)}${nominee.bio.length > 30 ? '...' : ''}\n`
      }
    })
    message += '\nEnter nominee number to vote:'

    return {
      sessionId,
      message,
      continueSession: true
    }

  } catch (error) {
    console.error('Error processing campaign selection:', error)
    return {
      sessionId,
      message: 'An error occurred. Please try again.',
      continueSession: false
    }
  }
}

async function processNomineeSelection(
  sessionId: string, 
  msisdn: string, 
  input: string, 
  network: string
): Promise<USSDResponse> {
  try {
    const sessionData = global.ussdSessions?.[sessionId]
    if (!sessionData || sessionData.step !== 'nominee_selection') {
      return {
        sessionId,
        message: 'Session expired. Please start over.',
        continueSession: true
      }
    }

    const nomineeIndex = parseInt(input) - 1
    const nominees = sessionData.nominees
    const selectedCampaign = sessionData.selectedCampaign

    if (nomineeIndex < 0 || nomineeIndex >= nominees.length) {
      return {
        sessionId,
        message: `Invalid selection. Please enter 1-${nominees.length}:`,
        continueSession: true
      }
    }

    const selectedNominee = nominees[nomineeIndex]
    const amount = selectedCampaign.amount_per_vote
    const amountInCedis = (amount / 100).toFixed(2)

    // Update session with selected nominee
    if (!global.ussdSessions) {
      global.ussdSessions = {}
    }
    global.ussdSessions[sessionId] = {
      ...sessionData,
      step: 'payment_confirmation',
      selectedNominee,
      amount
    }

    const confirmationMessage = `Payment Details:

Nominee: ${selectedNominee.name}
Amount: ${amountInCedis} GHS
Campaign: ${selectedCampaign.title}

Confirm payment? (Y/N):`

    return {
      sessionId,
      message: confirmationMessage,
      continueSession: true
    }

  } catch (error) {
    console.error('Error processing nominee selection:', error)
    return {
      sessionId,
      message: 'An error occurred. Please try again.',
      continueSession: false
    }
  }
}

async function processAmountInput(
  sessionId: string, 
  msisdn: string, 
  amountInput: string, 
  network: string
): Promise<USSDResponse> {
  try {
    // Get session data
    const sessionData = global.ussdSessions?.[sessionId]
    if (!sessionData) {
      return {
        sessionId,
        message: '❌ Session expired. Please start over by entering a nominee code.',
        continueSession: true
      }
    }

    const { nominee, ussdCode } = sessionData
    const amountPerVote = nominee.campaign.amount_per_vote
    const amountPerVoteInCedis = (amountPerVote / 100).toFixed(2)

    // Parse the amount
    const amount = parseFloat(amountInput)
    if (isNaN(amount) || amount <= 0) {
      return {
        sessionId,
        message: `❌ Invalid amount: ${amountInput}

Please enter a valid amount (e.g., 1.00, 5.00):
Amount per vote: GHS ${amountPerVoteInCedis}`,
        continueSession: true
      }
    }

    // Calculate number of votes
    const numberOfVotes = Math.floor(amount / (amountPerVote / 100))
    const totalAmount = numberOfVotes * amountPerVote
    const totalAmountInCedis = (totalAmount / 100).toFixed(2)

    if (numberOfVotes === 0) {
      return {
        sessionId,
        message: `❌ Amount too low!

Minimum amount: GHS ${amountPerVoteInCedis} (1 vote)
You entered: GHS ${amount.toFixed(2)}

Please enter a higher amount:`,
        continueSession: true
      }
    }

    // Update session with amount info
    if (!global.ussdSessions) {
      global.ussdSessions = {}
    }
    global.ussdSessions[sessionId] = {
      ...sessionData,
      amount: totalAmount,
      numberOfVotes,
      amountInput: amount
    }

    // Show confirmation
    const confirmationMessage = `📋 Vote Summary

Nominee: ${nominee.name}
Campaign: ${nominee.campaign.title}
Amount: GHS ${amount.toFixed(2)}
Votes: ${numberOfVotes} vote${numberOfVotes > 1 ? 's' : ''}
Total: GHS ${totalAmountInCedis}

Confirm vote? (YES/NO):`

    return {
      sessionId,
      message: confirmationMessage,
      continueSession: true
    }

  } catch (error) {
    console.error('Error processing amount input:', error)
    return {
      sessionId,
      message: '❌ An error occurred. Please try again.',
      continueSession: false
    }
  }
}

async function confirmPayment(
  sessionId: string, 
  msisdn: string, 
  network: string
): Promise<USSDResponse> {
  if (!supabase) {
    return {
      sessionId,
      message: 'Service temporarily unavailable. Please try again later.',
      continueSession: false
    }
  }

  try {
    // Get session data
    const sessionData = global.ussdSessions?.[sessionId]
    if (!sessionData || sessionData.step !== 'payment_confirmation') {
      return {
        sessionId,
        message: 'Session expired. Please start over.',
        continueSession: true
      }
    }

    const { selectedNominee, selectedCampaign, amount } = sessionData

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: null, // Anonymous user for USSD voting
        amount: amount,
        reference: `NALO-${Date.now()}-${selectedNominee.ussd_code || 'vote'}`,
        status: 'SUCCESS', // Mark as success for USSD voting
        method: 'NALO_USSD',
        campaign_id: selectedCampaign.id,
        metadata: {
          nominee_id: selectedNominee.id,
          nominee_name: selectedNominee.name,
          network: network,
          msisdn: msisdn,
          session_id: sessionId,
          ussd_code: selectedNominee.ussd_code
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return {
        sessionId,
        message: '❌ Payment Failed\n\nYour payment could not be processed. Please try again.\n\nReference: NALO-' + Date.now(),
        continueSession: false
      }
    }

    // Create vote record
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: null, // Anonymous user
        nominee_id: selectedNominee.id,
        campaign_id: selectedCampaign.id,
        amount: amount,
        payment_id: payment.id,
        status: 'SUCCESS'
      })

    if (voteError) {
      console.error('Vote creation error:', voteError)
      return {
        sessionId,
        message: '❌ Failed to record vote. Please try again.',
        continueSession: false
      }
    }

    // Update nominee vote count
    const { data: currentNominee } = await supabase
      .from('nominees')
      .select('votes_count')
      .eq('id', selectedNominee.id)
      .single()
    
    if (currentNominee) {
      await supabase
        .from('nominees')
        .update({ votes_count: currentNominee.votes_count + 1 })
        .eq('id', selectedNominee.id)
    }

    // Clear session data
    if (global.ussdSessions) {
      delete global.ussdSessions[sessionId]
    }

    const amountInCedis = (amount / 100).toFixed(2)

    return {
      sessionId,
      message: `✅ Payment Successful!

Your vote for ${selectedNominee.name} has been recorded successfully.

Reference: ${payment.reference}
Amount: ${amountInCedis} GHS

Thank you for voting with Towaba!`,
      continueSession: false
    }

  } catch (error) {
    console.error('Error confirming payment:', error)
    return {
      sessionId,
      message: '❌ An error occurred while processing your payment. Please try again later.',
      continueSession: false
    }
  }
}
