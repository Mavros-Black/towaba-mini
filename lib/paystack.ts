import axios from 'axios'

interface InitializePaymentParams {
  email: string
  amount: number // in kobo/pesewas
  callback_url: string
  metadata: Record<string, any>
}

interface PaymentResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export class PaystackService {
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || ''
    this.baseUrl = 'https://api.paystack.co'
  }

  async initializePayment(params: InitializePaymentParams): Promise<PaymentResponse> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured')
    }
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: params.email,
          amount: params.amount,
          callback_url: params.callback_url,
          metadata: params.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Paystack initialization error:', error)
      throw new Error('Failed to initialize payment')
    }
  }

  async verifyPayment(reference: string) {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured')
    }
    
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Paystack verification error:', error)
      throw new Error('Failed to verify payment')
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.secretKey) {
      console.error('Paystack secret key not configured for webhook verification')
      return false
    }
    
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload, 'utf8')
      .digest('hex')
    
    return hash === signature
  }
}
