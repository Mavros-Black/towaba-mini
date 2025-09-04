"use client"

import React, { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Loader2, ArrowLeft, Upload, Calendar, CreditCard, Users, Settings, CheckCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Category {
  name: string
  nominees: {
    name: string
    bio: string
    image: File | null
  }[]
}

interface Nominee {
  name: string
  bio: string
  image: File | null
}

interface CampaignFormData {
  title: string
  description: string
  coverImage: File | null
  startDate: string
  endDate: string
  amountPerVote: number
  isPublic: boolean
  allowAnonymousVoting: boolean
  maxVotesPerUser: number
  campaignType: 'categorized' | 'simple'
  requirePayment: boolean
  paymentMethods: string[]
  autoPublish: boolean
  allowEditing: boolean
  showVoteCounts: boolean
  showVoterNames: boolean
  categories: Category[]
  directNominees: Nominee[]
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Settings, description: 'Campaign title, description, and cover image' },
  { id: 2, title: 'Campaign Settings', icon: Calendar, description: 'Dates, voting rules, and visibility' },
  { id: 3, title: 'Voting & Payment', icon: CreditCard, description: 'Vote costs, payment methods, and limits' },
  { id: 4, title: 'Nominees', icon: Users, description: 'Add categories and nominees' },
  { id: 5, title: 'Review & Publish', icon: CheckCircle, description: 'Review all settings and publish' }
]

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    coverImage: null,
    startDate: '',
    endDate: '',
    amountPerVote: 1,
    isPublic: true,
    allowAnonymousVoting: true,
    maxVotesPerUser: 10,
    campaignType: 'categorized',
    requirePayment: true,
    paymentMethods: ['PAYSTACK'],
    autoPublish: false,
    allowEditing: true,
    showVoteCounts: true,
    showVoterNames: true, // Changed to true to show voter names by default
    categories: [{ name: '', nominees: [{ name: '', bio: '', image: null }] }],
    directNominees: [{ name: '', bio: '', image: null }]
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const updateFormData = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Campaign title is required')
          return false
        }
        if (!formData.description.trim()) {
          toast.error('Campaign description is required')
          return false
        }
        break
      case 2:
        if (!formData.startDate) {
          toast.error('Start date is required')
          return false
        }
        if (!formData.endDate) {
          toast.error('End date is required')
          return false
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          toast.error('End date must be after start date')
          return false
        }
        break
      case 3:
        if (formData.requirePayment && formData.amountPerVote < 1) {
          toast.error('Minimum amount per vote is 1 GHS')
          return false
        }
        if (formData.paymentMethods.length === 0) {
          toast.error('At least one payment method is required')
          return false
        }
        break
      case 4:
        if (formData.campaignType === 'categorized') {
          if (formData.categories.length === 0) {
            toast.error('At least one category is required')
            return false
          }
          for (const category of formData.categories) {
            if (!category.name.trim()) {
              toast.error('All category names are required')
              return false
            }
            if (category.nominees.length === 0) {
              toast.error(`Category "${category.name}" must have at least one nominee`)
              return false
            }
            for (const nominee of category.nominees) {
              if (!nominee.name.trim()) {
                toast.error('All nominee names are required')
                return false
              }
            }
          }
        } else {
          if (formData.directNominees.length === 0) {
            toast.error('At least one nominee is required')
            return false
          }
          for (const nominee of formData.directNominees) {
            if (!nominee.name.trim()) {
              toast.error('All nominee names are required')
              return false
            }
          }
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }

  const handleImageUpload = (file: File | null) => {
    if (file) {
      updateFormData('coverImage', file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addCategory = () => {
    updateFormData('categories', [
      ...formData.categories,
      { name: '', nominees: [{ name: '', bio: '', image: null }] }
    ])
  }

  const removeCategory = (index: number) => {
    if (formData.categories.length > 1) {
      updateFormData('categories', formData.categories.filter((_, i) => i !== index))
    }
  }

  const updateCategory = (index: number, field: string, value: string) => {
    const updatedCategories = [...formData.categories]
    updatedCategories[index] = { ...updatedCategories[index], [field]: value }
    updateFormData('categories', updatedCategories)
  }

  const addNomineeToCategory = (categoryIndex: number) => {
    const updatedCategories = [...formData.categories]
    updatedCategories[categoryIndex].nominees.push({ name: '', bio: '', image: null })
    updateFormData('categories', updatedCategories)
  }

  const removeNomineeFromCategory = (categoryIndex: number, nomineeIndex: number) => {
    const updatedCategories = [...formData.categories]
    if (updatedCategories[categoryIndex].nominees.length > 1) {
      updatedCategories[categoryIndex].nominees.splice(nomineeIndex, 1)
      updateFormData('categories', updatedCategories)
    }
  }

  const updateNomineeInCategory = (categoryIndex: number, nomineeIndex: number, field: string, value: string | File | null) => {
    const updatedCategories = [...formData.categories]
    updatedCategories[categoryIndex].nominees[nomineeIndex] = {
      ...updatedCategories[categoryIndex].nominees[nomineeIndex],
      [field]: value
    }
    updateFormData('categories', updatedCategories)
  }

  const addDirectNominee = () => {
    updateFormData('directNominees', [
      ...formData.directNominees,
      { name: '', bio: '', image: null }
    ])
  }

  const removeDirectNominee = (index: number) => {
    if (formData.directNominees.length > 1) {
      updateFormData('directNominees', formData.directNominees.filter((_, i) => i !== index))
    }
  }

  const updateDirectNominee = (index: number, field: string, value: string | File | null) => {
    const updatedNominees = [...formData.directNominees]
    updatedNominees[index] = { ...updatedNominees[index], [field]: value }
    updateFormData('directNominees', updatedNominees)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.access_token) {
      toast.error('Authentication required. Please log in again.')
      return
    }
    
    if (!validateCurrentStep()) {
      return
    }

    setLoading(true)

    try {
      let coverImageUrl = null
      if (formData.coverImage) {
        const coverFormData = new FormData()
        coverFormData.append('file', formData.coverImage)
        coverFormData.append('folder', 'campaigns')

        const coverResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: coverFormData,
        })

        if (!coverResponse.ok) {
          throw new Error('Failed to upload campaign cover image')
        }

        const coverData = await coverResponse.json()
        coverImageUrl = coverData.url
      }

      let processedCategories = null
      let processedDirectNominees = null

      if (formData.campaignType === 'categorized') {
        processedCategories = await Promise.all(
          formData.categories.map(async (category) => {
            const processedNominees = await Promise.all(
              category.nominees.map(async (nominee) => {
                let imageUrl = null
                if (nominee.image) {
                  const nomineeFormData = new FormData()
                  nomineeFormData.append('file', nominee.image)
                  nomineeFormData.append('folder', 'nominees')

                  const nomineeResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: nomineeFormData,
                  })

                  if (!nomineeResponse.ok) {
                    throw new Error(`Failed to upload image for nominee ${nominee.name}`)
                  }

                  const nomineeData = await nomineeResponse.json()
                  imageUrl = nomineeData.url
                }

                return {
                  name: nominee.name,
                  bio: nominee.bio,
                  image: imageUrl
                }
              })
            )

            return {
              name: category.name,
              nominees: processedNominees
            }
          })
        )
      } else {
        processedDirectNominees = await Promise.all(
          formData.directNominees.map(async (nominee) => {
            let imageUrl = null
            if (nominee.image) {
              const nomineeFormData = new FormData()
              nomineeFormData.append('file', nominee.image)
              nomineeFormData.append('folder', 'nominees')

              const nomineeResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session?.access_token}`
                },
                body: nomineeFormData,
              })

              if (!nomineeResponse.ok) {
                throw new Error(`Failed to upload image for nominee ${nominee.name}`)
              }

              const nomineeData = await nomineeResponse.json()
              imageUrl = nomineeData.url
            }

            return {
              name: nominee.name,
              bio: nominee.bio,
              image: imageUrl
            }
          })
        )
      }

      const campaignData = {
        title: formData.title,
        description: formData.description,
        coverImage: coverImageUrl,
        startDate: formData.startDate,
        endDate: formData.endDate,
        amountPerVote: formData.amountPerVote * 100, // Convert GHS to pesewas for backend
        isPublic: formData.isPublic,
        allowAnonymousVoting: formData.allowAnonymousVoting,
        maxVotesPerUser: formData.maxVotesPerUser,
        campaignType: formData.campaignType,
        requirePayment: formData.requirePayment,
        paymentMethods: formData.paymentMethods,
        autoPublish: formData.autoPublish,
        allowEditing: formData.allowEditing,
        showVoteCounts: formData.showVoteCounts,
        showVoterNames: formData.showVoterNames,
        categories: processedCategories,
        directNominees: processedDirectNominees
      }

      const response = await fetch('/api/organizer/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create campaign')
      }

      const result = await response.json()
      console.log('Campaign creation response:', result)
      
      if (result.success && result.data?.id) {
        toast.success('Campaign created successfully!')
        router.push('/organizer/campaigns')
      } else {
        console.error('Invalid response structure:', result)
        throw new Error('Campaign created but no ID returned')
      }
    } catch (error) {
      console.error('Campaign creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 transition-all duration-300">
          <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="p-8">
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-lg">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Campaign Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="Enter campaign title"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your campaign..."
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Cover Image</Label>
              <div className="mt-1">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            updateFormData('coverImage', null)
                            setImagePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4 text-center">
                        <Upload className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-medium">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="campaignType" className="text-sm font-medium">Campaign Structure</Label>
              <Select
                value={formData.campaignType}
                onValueChange={(value: 'categorized' | 'simple') => updateFormData('campaignType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="categorized">Categorized (with categories)</SelectItem>
                  <SelectItem value="simple">Simple (direct nominees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Make Campaign Public</Label>
                  <p className="text-xs text-muted-foreground">Anyone can view and vote</p>
                </div>
                <Switch
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => updateFormData('isPublic', checked)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Anonymous Voting</Label>
                  <p className="text-xs text-muted-foreground">Voters don't need to register</p>
                </div>
                <Switch
                  checked={formData.allowAnonymousVoting}
                  onCheckedChange={(checked) => updateFormData('allowAnonymousVoting', checked)}
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Require Payment for Voting</Label>
                  <p className="text-xs text-muted-foreground">Voters must pay to cast votes</p>
                </div>
                <Switch
                  checked={formData.requirePayment}
                  onCheckedChange={(checked) => updateFormData('requirePayment', checked)}
                />
              </div>
              
              {formData.requirePayment && (
                <div>
                  <Label htmlFor="amountPerVote" className="text-sm font-medium">Amount per Vote (GHS)</Label>
                  <Input
                    id="amountPerVote"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.amountPerVote}
                    onChange={(e) => updateFormData('amountPerVote', parseInt(e.target.value))}
                    placeholder="1"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum: 1 GHS per vote
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium">Payment Methods</Label>
              <div className="mt-1 space-y-2">
                {['PAYSTACK', 'NALO_USSD'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={method}
                      checked={formData.paymentMethods.includes(method)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData('paymentMethods', [...formData.paymentMethods, method])
                        } else {
                          updateFormData('paymentMethods', formData.paymentMethods.filter(m => m !== method))
                        }
                      }}
                    />
                    <Label htmlFor={method} className="text-sm">{method === 'PAYSTACK' ? 'Paystack (Card/Bank Transfer)' : 'Nalo USSD'}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="maxVotesPerUser" className="text-sm font-medium">Maximum Votes per User</Label>
              <Input
                id="maxVotesPerUser"
                type="number"
                min="1"
                value={formData.maxVotesPerUser}
                onChange={(e) => updateFormData('maxVotesPerUser', parseInt(e.target.value))}
                placeholder="10"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set to 0 for unlimited votes
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Vote Counts</Label>
                  <p className="text-xs text-muted-foreground">Display current vote counts</p>
                </div>
                <Switch
                  checked={formData.showVoteCounts}
                  onCheckedChange={(checked) => updateFormData('showVoteCounts', checked)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Show Voter Names</Label>
                  <p className="text-xs text-muted-foreground">Display who voted</p>
                </div>
                <Switch
                  checked={formData.showVoterNames}
                  onCheckedChange={(checked) => updateFormData('showVoterNames', checked)}
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            {formData.campaignType === 'categorized' ? (
              <div className="space-y-4">
                {formData.categories.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="p-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                        className="text-base font-medium"
                      />
                      {formData.categories.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCategory(categoryIndex)}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {category.nominees.map((nominee, nomineeIndex) => (
                        <div key={nomineeIndex} className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3 p-3 border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Nominee name"
                              value={nominee.name}
                              onChange={(e) => updateNomineeInCategory(categoryIndex, nomineeIndex, 'name', e.target.value)}
                              size={20}
                            />
                            <Textarea
                              placeholder="Nominee bio"
                              value={nominee.bio}
                              onChange={(e) => updateNomineeInCategory(categoryIndex, nomineeIndex, 'bio', e.target.value)}
                              rows={2}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => updateNomineeInCategory(categoryIndex, nomineeIndex, 'image', e.target.files?.[0] || null)}
                                className="text-xs"
                              />
                              {nominee.image && (
                                <span className="text-xs text-green-600">✓ Image selected</span>
                              )}
                            </div>
                          </div>
                          
                          {category.nominees.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeNomineeFromCategory(categoryIndex, nomineeIndex)}
                              className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addNomineeToCategory(categoryIndex)}
                        className="w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Nominee
                      </Button>
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {formData.directNominees.map((nominee, index) => (
                  <Card key={index} className="p-4 border">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Nominee name"
                          value={nominee.name}
                          onChange={(e) => updateDirectNominee(index, 'name', e.target.value)}
                          size={20}
                        />
                        <Textarea
                          placeholder="Nominee bio"
                          value={nominee.bio}
                          onChange={(e) => updateDirectNominee(index, 'bio', e.target.value)}
                          rows={2}
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => updateDirectNominee(index, 'image', e.target.files?.[0] || null)}
                            className="text-xs"
                          />
                          {nominee.image && (
                            <span className="text-xs text-green-600">✓ Image selected</span>
                          )}
                        </div>
                      </div>
                      
                      {formData.directNominees.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDirectNominee(index)}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDirectNominee}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Nominee
                </Button>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold">Review Your Campaign</h3>
              <p className="text-sm text-muted-foreground">Review all settings before publishing</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm">
                  <div><span className="font-medium">Title:</span> {formData.title}</div>
                  <div><span className="font-medium">Description:</span> {formData.description.substring(0, 100)}...</div>
                  <div><span className="font-medium">Cover Image:</span> {formData.coverImage ? '✓ Selected' : 'None'}</div>
                </CardContent>
              </Card>
              
              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Campaign Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm">
                  <div><span className="font-medium">Start Date:</span> {formData.startDate ? new Date(formData.startDate).toLocaleString() : 'Not set'}</div>
                  <div><span className="font-medium">End Date:</span> {formData.endDate ? new Date(formData.endDate).toLocaleString() : 'Not set'}</div>
                  <div><span className="font-medium">Type:</span> {formData.campaignType === 'categorized' ? 'Categorized' : 'Simple'}</div>
                  <div><span className="font-medium">Public:</span> {formData.isPublic ? 'Yes' : 'No'}</div>
                </CardContent>
              </Card>
              
              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Voting & Payment</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm">
                  <div><span className="font-medium">Payment Required:</span> {formData.requirePayment ? 'Yes' : 'No'}</div>
                  {formData.requirePayment && (
                    <div><span className="font-medium">Amount per Vote:</span> {formData.amountPerVote} GHS</div>
                  )}
                  <div><span className="font-medium">Payment Methods:</span> {formData.paymentMethods.join(', ')}</div>
                  <div><span className="font-medium">Max Votes per User:</span> {formData.maxVotesPerUser}</div>
                </CardContent>
              </Card>
              
              <Card className="p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Nominees</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm">
                  {formData.campaignType === 'categorized' ? (
                    <div><span className="font-medium">Categories:</span> {formData.categories.length}</div>
                  ) : (
                    <div><span className="font-medium">Direct Nominees:</span> {formData.directNominees.length}</div>
                  )}
                  <div><span className="font-medium">Anonymous Voting:</span> {formData.allowAnonymousVoting ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Show Vote Counts:</span> {formData.showVoteCounts ? 'Yes' : 'No'}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-publish Campaign</Label>
                  <p className="text-xs text-muted-foreground">Publish immediately after creation</p>
                </div>
                <Switch
                  checked={formData.autoPublish}
                  onCheckedChange={(checked) => updateFormData('autoPublish', checked)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Editing After Creation</Label>
                  <p className="text-xs text-muted-foreground">Modify campaign settings after publishing</p>
                </div>
                <Switch
                  checked={formData.allowEditing}
                  onCheckedChange={(checked) => updateFormData('allowEditing', checked)}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 transition-all duration-300 min-w-0 overflow-hidden lg:ml-64">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="p-2 sm:p-4 lg:p-6">
                    <Card className="w-4/5 mx-auto shadow-lg border-0">
            <CardHeader className="pb-4">
              {/* Compact Header */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <Link href="/organizer/campaigns">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="text-center sm:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold">Create Campaign</h1>
                  <p className="text-sm text-muted-foreground">Step-by-step setup</p>
                </div>
              </div>
              
              {/* Compact Stepper */}
              <div className="mb-4">
                {/* Mobile Progress */}
                <div className="block sm:hidden mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Step {currentStep} of {STEPS.length}</span>
                    <span>{STEPS[currentStep - 1].title}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Desktop Stepper */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-center space-x-2">
                    {STEPS.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <button
                          onClick={() => goToStep(step.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            currentStep === step.id
                              ? 'bg-primary text-primary-foreground'
                              : currentStep > step.id
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            currentStep > step.id
                              ? 'bg-green-600 text-white'
                              : currentStep === step.id
                              ? 'bg-white text-primary'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}>
                            {currentStep > step.id ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <step.icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className="font-medium">{step.title}</span>
                        </button>
                        
                        {index < STEPS.length - 1 && (
                          <div className={`w-8 h-0.5 mx-2 ${
                            currentStep > step.id ? 'bg-green-400' : 'bg-muted'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Compact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center space-x-2 mb-3">
                    {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
                    <span className="font-medium text-lg">{STEPS[currentStep - 1].title}</span>
                  </div>
                  {renderStepContent()}
                </div>

                {/* Compact Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="w-full sm:w-auto order-2 sm:order-1"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center justify-center sm:justify-end space-x-3 order-1 sm:order-2">
                    {currentStep < STEPS.length ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                        size="sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                        size="sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Create Campaign
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
