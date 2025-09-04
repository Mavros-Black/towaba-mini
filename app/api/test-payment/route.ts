import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log the request to see what's being sent
    console.log('Payment test request:', body)
    
    // Return a simple success response for testing
    return NextResponse.json({
      success: true,
      message: 'Payment test endpoint working',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Payment test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Payment test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
