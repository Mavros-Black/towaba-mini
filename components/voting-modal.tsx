"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

interface VotingModalProps {
  isOpen: boolean
  onClose: () => void
  nominee: {
    id: string
    name: string
    photoUrl?: string
    bio?: string | null
  }
  campaign: {
    id: string
    title: string
  }
}

export function VotingModal({ isOpen, onClose, nominee, campaign }: VotingModalProps) {
  const [voterName, setVoterName] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK' | 'NALO_USSD' | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!voterName || !amount || !paymentMethod) {
      toast.error('Please fill in all required fields')
      return
    }

    const amountInPesewas = parseInt(amount) * 100 // Convert GHS to pesewas
    
    if (amountInPesewas < 100) {
      toast.error('Minimum amount is 1 GHS')
      return
    }

    if (paymentMethod === 'PAYSTACK' && !email) {
      toast.error('Email is required for Paystack payments')
      return
    }

    if (paymentMethod === 'NALO_USSD' && !phone) {
      toast.error('Phone number is required for USSD payments')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/payments/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          nomineeId: nominee.id,
          amount: amountInPesewas,
          method: paymentMethod,
          voterName,
          email,
          phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      if (paymentMethod === 'PAYSTACK' && data.data?.authorizationUrl) {
        // Redirect to Paystack payment page
        toast.success('Redirecting to payment gateway...')
        window.location.href = data.data.authorizationUrl
      } else {
        // For other payment methods or demo mode
        setIsSuccess(true)
        toast.success('Vote submitted successfully!')
        console.log('Payment initialized:', data)
      }

    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      // Reset form
      setVoterName('')
      setAmount('')
      setPaymentMethod(null)
      setEmail('')
      setPhone('')
      setIsSuccess(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Vote for {nominee.name}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nominee Info */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    {nominee.photoUrl ? (
                      <img
                        src={nominee.photoUrl}
                        alt={nominee.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {nominee.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{nominee.name}</h3>
                  {nominee.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{nominee.bio}</p>
                  )}
                </div>

                {/* Voter Name Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    disabled={isProcessing}
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vote Amount (GHS)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in GHS"
                    required
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: 1 GHS
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYSTACK"
                        checked={paymentMethod === 'PAYSTACK'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'PAYSTACK')}
                        disabled={isProcessing}
                        className="text-primary"
                      />
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Paystack (Card/Bank Transfer)</span>
                    </label>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="NALO_USSD"
                        checked={paymentMethod === 'NALO_USSD'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'NALO_USSD')}
                        disabled={isProcessing}
                        className="text-primary"
                      />
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span className="text-foreground">USSD (Mobile Money)</span>
                    </label>
                  </div>
                </div>

                {/* Conditional Fields */}
                {paymentMethod === 'PAYSTACK' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                )}

                {paymentMethod === 'NALO_USSD' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      disabled={isProcessing}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  loading={isProcessing}
                  disabled={!voterName || !amount || !paymentMethod || isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Vote with ${formatCurrency(parseInt(amount || '0') * 100)}`}
                </Button>
              </form>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Vote Submitted!
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your vote for {nominee.name} has been submitted successfully.
                </p>
                <Button onClick={handleClose} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
