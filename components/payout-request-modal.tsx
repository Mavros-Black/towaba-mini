"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DollarSign, 
  Calendar, 
  Award, 
  CreditCard, 
  Building2, 
  User, 
  Hash,
  Loader2,
  AlertCircle,
  Smartphone,
  Banknote
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PayoutRequestModalProps {
  availableBalance: number
  onPayoutRequested: (data: PayoutRequestData) => Promise<void>
  isCreating: boolean
  children: React.ReactNode
}

interface PayoutRequestData {
  amount: number
  request_type: 'DAILY' | 'WEEKLY' | 'END_OF_PROGRAM'
  bank_details: {
    payment_method?: 'bank' | 'mobile_money'
    account_name?: string
    account_number?: string
    bank_name?: string
    branch?: string
    mobile_network?: string
    mobile_number?: string
    notes?: string
  }
}

const formatCurrency = (amount: number): string => {
  return `₵${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}

export function PayoutRequestModal({ 
  availableBalance, 
  onPayoutRequested, 
  isCreating, 
  children 
}: PayoutRequestModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<PayoutRequestData>({
    amount: 0,
    request_type: 'WEEKLY',
    bank_details: {
      payment_method: 'bank',
      account_name: '',
      account_number: '',
      bank_name: '',
      branch: '',
      mobile_network: '',
      mobile_number: '',
      notes: ''
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else if (formData.amount > availableBalance) {
      newErrors.amount = `Amount cannot exceed available balance of ${formatCurrency(availableBalance)}`
    }

    // Validate payment details based on method
    if (formData.bank_details.payment_method === 'bank') {
      if (!formData.bank_details.account_name?.trim()) {
        newErrors.account_name = 'Account name is required'
      }
      if (!formData.bank_details.account_number?.trim()) {
        newErrors.account_number = 'Account number is required'
      }
      if (!formData.bank_details.bank_name?.trim()) {
        newErrors.bank_name = 'Bank name is required'
      }
    } else if (formData.bank_details.payment_method === 'mobile_money') {
      if (!formData.bank_details.mobile_network?.trim()) {
        newErrors.mobile_network = 'Mobile network is required'
      }
      if (!formData.bank_details.mobile_number?.trim()) {
        newErrors.mobile_number = 'Mobile number is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onPayoutRequested(formData)
      setOpen(false)
      // Reset form
      setFormData({
        amount: 0,
        request_type: 'WEEKLY',
        bank_details: {
          payment_method: 'bank',
          account_name: '',
          account_number: '',
          bank_name: '',
          branch: '',
          mobile_network: '',
          mobile_number: '',
          notes: ''
        }
      })
      setErrors({})
    } catch (error) {
      console.error('Error submitting payout request:', error)
    }
  }

  const handleAmountChange = (value: string) => {
    // Only convert to pesewas if value is not empty
    const amount = value === '' ? 0 : parseFloat(value) * 100
    setFormData(prev => ({ ...prev, amount }))
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'DAILY':
        return <Calendar className="w-4 h-4" />
      case 'WEEKLY':
        return <Calendar className="w-4 h-4" />
      case 'END_OF_PROGRAM':
        return <Award className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const getRequestTypeDescription = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'Request payout daily (processed within 24 hours)'
      case 'WEEKLY':
        return 'Request payout weekly (processed every Monday)'
      case 'END_OF_PROGRAM':
        return 'Request payout at the end of your campaign'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span>Request Payout</span>
          </DialogTitle>
          <DialogDescription>
            Request a payout from your available balance. The 15% platform commission has already been deducted from your earnings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Balance Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Available Balance: <strong>{formatCurrency(availableBalance)}</strong>
            </AlertDescription>
          </Alert>

          {/* Amount and Request Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input
                id="amount"
                type="text"
                value={formData.amount === 0 ? '' : (formData.amount / 100).toString()}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_type">Payout Type</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value: 'DAILY' | 'WEEKLY' | 'END_OF_PROGRAM') => 
                  setFormData(prev => ({ ...prev, request_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">
                    <div className="flex items-center space-x-2">
                      {getRequestTypeIcon('DAILY')}
                      <span>Daily</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="WEEKLY">
                    <div className="flex items-center space-x-2">
                      {getRequestTypeIcon('WEEKLY')}
                      <span>Weekly</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="END_OF_PROGRAM">
                    <div className="flex items-center space-x-2">
                      {getRequestTypeIcon('END_OF_PROGRAM')}
                      <span>End of Program</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {getRequestTypeDescription(formData.request_type)}
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Banknote className="w-4 h-4" />
                <span>Payment Details</span>
              </CardTitle>
              <CardDescription>
                Provide your payment information for the payout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.bank_details.payment_method || 'bank'}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    bank_details: { ...prev.bank_details, payment_method: value as 'bank' | 'mobile_money' }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.bank_details.payment_method === 'bank' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_name">Account Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="account_name"
                          value={formData.bank_details.account_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, account_name: e.target.value }
                          }))}
                          placeholder="John Doe"
                          className={`pl-10 ${errors.account_name ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.account_name && (
                        <p className="text-sm text-red-500">{errors.account_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account_number">Account Number</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="account_number"
                          value={formData.bank_details.account_number}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, account_number: e.target.value }
                          }))}
                          placeholder="1234567890"
                          className={`pl-10 ${errors.account_number ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.account_number && (
                        <p className="text-sm text-red-500">{errors.account_number}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="bank_name"
                          value={formData.bank_details.bank_name}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            bank_details: { ...prev.bank_details, bank_name: e.target.value }
                          }))}
                          placeholder="Ghana Commercial Bank"
                          className={`pl-10 ${errors.bank_name ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.bank_name && (
                        <p className="text-sm text-red-500">{errors.bank_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch (Optional)</Label>
                      <Input
                        id="branch"
                        value={formData.bank_details.branch || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bank_details: { ...prev.bank_details, branch: e.target.value }
                        }))}
                        placeholder="Accra Main Branch"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mobile_network">Mobile Network</Label>
                    <Select
                      value={formData.bank_details.mobile_network || ''}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        bank_details: { ...prev.bank_details, mobile_network: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTN">MTN</SelectItem>
                        <SelectItem value="Vodafone">Vodafone</SelectItem>
                        <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="mobile_number"
                        value={formData.bank_details.mobile_number || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bank_details: { ...prev.bank_details, mobile_number: e.target.value }
                        }))}
                        placeholder="0241234567"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.bank_details.notes || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bank_details: { ...prev.bank_details, notes: e.target.value }
                  }))}
                  placeholder="Any additional notes for this payout request..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Requested Amount:</span>
                  <span className="font-medium">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Note:</span>
                  <span>Commission already deducted from earnings</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">You will receive:</span>
                  <span className="font-bold text-green-600">{formatCurrency(formData.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || availableBalance <= 0}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Request...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Payout
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
