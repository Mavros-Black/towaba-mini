import { NextRequest, NextResponse } from 'next/server'
import { PaystackService } from '@/lib/paystack'
import { prisma } from '@/lib/prisma'

const paystackService = new PaystackService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    if (!paystackService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    // Handle payment verification
    if (event === 'charge.success') {
      const { reference, amount, metadata } = data

      // Verify payment with Paystack
      const verification = await paystackService.verifyPayment(reference)
      
      if (!verification.status || verification.data.status !== 'success') {
        console.error('Payment verification failed:', verification)
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        )
      }

      // Update payment status
      const payment = await prisma.payment.update({
        where: { reference },
        data: { 
          status: 'SUCCESS',
          metadata: {
            ...metadata,
            paystackData: verification.data
          }
        }
      })

      // Update vote status
      await prisma.vote.updateMany({
        where: { paymentId: payment.id },
        data: { status: 'SUCCESS' }
      })

      // Get the vote to find nomineeId
      const voteData = await prisma.vote.findFirst({
        where: { paymentId: payment.id }
      })

      console.log(`Payment successful: ${reference}, Vote: ${voteData?.id}, Nominee: ${voteData?.nomineeId}`)
      console.log('Vote count will be automatically updated by database trigger')
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
