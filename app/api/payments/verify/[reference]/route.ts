import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaystackService } from '@/lib/paystack'

const paystackService = new PaystackService()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params
    const { searchParams } = new URL(request.url)
    const trxref = searchParams.get('trxref')
    const paystackReference = searchParams.get('reference')

    console.log('=== PAYMENT VERIFICATION START ===')
    console.log('Path reference:', reference)
    console.log('Trxref:', trxref)
    console.log('Paystack reference:', paystackReference)

    // Use the most appropriate reference for verification
    let verificationReference = reference
    if (trxref && trxref !== reference) {
      verificationReference = trxref
      console.log('Using trxref as verification reference:', verificationReference)
    }

    if (!verificationReference) {
      console.error('No valid reference found')
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    console.log('Final verification reference:', verificationReference)

    // First, check if payment exists in our database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference) // Always use the path reference for database lookup
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found in database:', paymentError)
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      )
    }

    console.log('Payment found in database:', payment)
    console.log('Campaign ID from payment:', payment.campaign_id)
    console.log('Payment status:', payment.status)

    // If payment is already successful, just redirect
    if (payment.status === 'SUCCESS') {
      console.log('Payment already successful, redirecting...')
      let successUrl
      if (payment.campaign_id) {
        successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campaigns/${payment.campaign_id}?payment=success&reference=${reference}`
      } else {
        // Fallback to a general success page if no campaign ID
        successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-success?reference=${reference}`
      }
      return NextResponse.redirect(successUrl)
    }

    // Verify payment with Paystack
    console.log('Calling Paystack verification API...')
    console.log('Reference being verified:', verificationReference)
    
    try {
      const verification = await paystackService.verifyPayment(verificationReference)
      console.log('Paystack verification response:', JSON.stringify(verification, null, 2))
      
      if (!verification) {
        console.error('Paystack verification returned null/undefined')
        return NextResponse.json(
          { error: 'Payment verification failed: No response from Paystack' },
          { status: 400 }
        )
      }

      if (!verification.status) {
        console.error('Paystack verification failed - status false:', verification)
        return NextResponse.json(
          { error: 'Payment verification failed: ' + (verification.message || 'Unknown error') },
          { status: 400 }
        )
      }

      if (!verification.data) {
        console.error('Paystack verification failed - no data:', verification)
        return NextResponse.json(
          { error: 'Payment verification failed: No data in response' },
          { status: 400 }
        )
      }

      console.log('Payment verified successfully with Paystack:', verification.data)
      console.log('Payment status from Paystack:', verification.data.status)

      if (verification.data.status !== 'success') {
        console.error('Payment not successful on Paystack:', verification.data)
        return NextResponse.json(
          { error: 'Payment not successful on Paystack. Status: ' + verification.data.status },
          { status: 400 }
        )
      }

      // Update payment status - try both possible column names
      console.log('Attempting to update payment status...')
      console.log('Payment ID:', payment.id)
      console.log('Current payment status:', payment.status)
      
      let updateError = null
      
      // First try with 'status' column
      const { error: statusUpdateError } = await supabase
        .from('payments')
        .update({ 
          status: 'SUCCESS',
          metadata: {
            ...payment.metadata,
            paystackData: verification.data,
            verifiedAt: new Date().toISOString(),
            paystackReference: verificationReference
          }
        })
        .eq('id', payment.id)

      if (statusUpdateError) {
        console.error('Failed to update payment status with "status" column:', statusUpdateError)
        
        // Try with 'payment_status' column as fallback
        const { error: paymentStatusUpdateError } = await supabase
          .from('payments')
          .update({ 
            payment_status: 'SUCCESS',
            metadata: {
              ...payment.metadata,
              paystackData: verification.data,
              verifiedAt: new Date().toISOString(),
              paystackReference: verificationReference
            }
          })
          .eq('id', payment.id)

        if (paymentStatusUpdateError) {
          console.error('Failed to update payment status with "payment_status" column:', paymentStatusUpdateError)
          updateError = paymentStatusUpdateError
        } else {
          console.log('Payment status updated to SUCCESS using "payment_status" column')
        }
      } else {
        console.log('Payment status updated to SUCCESS using "status" column')
      }

      if (updateError) {
        console.error('Failed to update payment status with both column names')
        return NextResponse.json(
          { error: 'Failed to update payment status: ' + updateError.message },
          { status: 500 }
        )
      }

      // Get vote record
      const { data: vote, error: voteError } = await supabase
        .from('votes')
        .select('*')
        .eq('payment_id', payment.id)
        .single()

      if (voteError || !vote) {
        console.error('Vote not found:', voteError)
        return NextResponse.json(
          { error: 'Vote record not found' },
          { status: 500 }
        )
      }

      console.log('Vote found:', vote)

      // Update vote status
      const { error: voteUpdateError } = await supabase
        .from('votes')
        .update({ status: 'SUCCESS' })
        .eq('id', vote.id)

      if (voteUpdateError) {
        console.error('Failed to update vote status:', voteUpdateError)
        return NextResponse.json(
          { error: 'Failed to update vote status' },
          { status: 500 }
        )
      }

      console.log('Vote status updated to SUCCESS')
      console.log('Vote count will be automatically updated by database trigger')

      console.log(`Payment successful: ${reference}, Vote: ${vote.id}, Nominee: ${vote.nominee_id}`)

      // Redirect to success page
      let successUrl
      if (payment.campaign_id) {
        successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campaigns/${payment.campaign_id}?payment=success&reference=${reference}`
      } else {
        // Fallback to a general success page if no campaign ID
        successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment-success?reference=${reference}`
      }
      
      console.log('Redirecting to:', successUrl)
      return NextResponse.redirect(successUrl)

    } catch (paystackError) {
      console.error('Paystack verification error:', paystackError)
      if (paystackError instanceof Error) {
        console.error('Paystack error message:', paystackError.message)
        console.error('Paystack error stack:', paystackError.stack)
      }
      return NextResponse.json(
        { error: 'Payment verification failed: ' + (paystackError instanceof Error ? paystackError.message : 'Paystack API error') },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Payment verification error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { error: 'Payment verification failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
