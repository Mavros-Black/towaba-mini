import { NextRequest, NextResponse } from 'next/server'
import { NaloService } from '@/lib/nalo'
import { prisma } from '@/lib/prisma'

const naloService = new NaloService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-nalo-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Verify webhook signature
    if (!naloService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)
    const { event, data } = payload

    // Handle payment verification
    if (event === 'payment.success') {
      const { reference, amount, metadata } = data

      // Verify payment with Nalo
      const verification = await naloService.verifyPayment(reference)
      
      if (!verification.status || verification.data.status !== 'success') {
        console.error('Nalo payment verification failed:', verification)
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
            naloData: verification.data
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

      console.log(`Nalo payment successful: ${reference}, Vote: ${voteData?.id}, Nominee: ${voteData?.nomineeId}`)
      console.log('Vote count will be automatically updated by database trigger')
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Nalo webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
