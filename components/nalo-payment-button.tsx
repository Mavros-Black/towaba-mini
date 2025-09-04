"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Wifi, WifiOff } from 'lucide-react'

interface NaloPaymentButtonProps {
  campaignId: string
  nomineeId: string
  nomineeName: string
  amount: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function NaloPaymentButton({ 
  campaignId, 
  nomineeId, 
  nomineeName, 
  amount, 
  onSuccess, 
  onError 
}: NaloPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  const handleNaloPayment = async () => {
    setIsLoading(true)
    
    try {
      // Create payment record
      const response = await fetch('/api/payments/nalo/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          nomineeId,
          amount,
          method: 'NALO_USSD'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      // Show USSD instructions
      setShowInstructions(true)
      onSuccess?.()
      
    } catch (error) {
      console.error('Nalo payment error:', error)
      onError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (showInstructions) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-lg">USSD Payment Instructions</CardTitle>
          <CardDescription>
            Follow these steps to complete your payment via mobile money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Step-by-Step Guide:</h4>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Dial <code className="bg-blue-200 px-2 py-1 rounded">*920*123#</code></li>
              <li>2. Select "Vote for Campaign"</li>
              <li>3. Choose your campaign</li>
              <li>4. Select "{nomineeName}"</li>
              <li>5. Confirm payment of {amount} GHS</li>
              <li>6. Enter your mobile money PIN</li>
            </ol>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Wifi className="w-4 h-4" />
            <span>No internet required - works on any mobile phone</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowInstructions(false)}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle className="text-lg">USSD Mobile Payment</CardTitle>
        <CardDescription>
          Pay {amount} GHS for {nomineeName} via mobile money
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Benefits:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Works on any mobile phone</li>
            <li>• No internet connection needed</li>
            <li>• Instant payment confirmation</li>
            <li>• Secure mobile money transaction</li>
          </ul>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <WifiOff className="w-4 h-4" />
          <span>Available on MTN, Vodafone, and AirtelTigo</span>
        </div>
        
        <Button 
          onClick={handleNaloPayment}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Initializing...' : `Pay ${amount} GHS via USSD`}
        </Button>
      </CardContent>
    </Card>
  )
}
