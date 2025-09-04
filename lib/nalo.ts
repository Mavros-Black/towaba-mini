import axios from 'axios'

interface InitializeUSSDParams {
  phone: string
  amount: number // in kobo/pesewas
  metadata: Record<string, any>
}

interface USSDResponse {
  status: boolean
  message: string
  data: {
    ussd_code: string
    reference: string
    instructions: string
  }
}

export class NaloService {
  private apiKey: string
  private secret: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.NALO_API_KEY!
    this.secret = process.env.NALO_SECRET!
    this.baseUrl = process.env.NALO_BASE_URL || 'https://api.nalosolutions.com'
  }

  async initializeUSSD(params: InitializeUSSDParams): Promise<USSDResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/ussd/initialize`,
        {
          phone: params.phone,
          amount: params.amount,
          metadata: params.metadata,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Secret': this.secret,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Nalo USSD initialization error:', error)
      throw new Error('Failed to initialize USSD payment')
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Secret': this.secret,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Nalo payment verification error:', error)
      throw new Error('Failed to verify Nalo payment')
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(payload, 'utf8')
      .digest('hex')
    
    return hash === signature
  }
}
