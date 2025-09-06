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
import { Plus, X, Loader2, ArrowLeft, Upload, Calendar, CreditCard, Users, Settings, CheckCircle, ChevronRight, Shield } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'

interface Category {
  id?: string
  name: string
  nominees: {
    id?: string
    name: string
    bio: string
    image: string | null
    imageFile?: File | null
  }[]
}

interface Nominee {
  id?: string
  name: string
  bio: string
  image: string | null
  imageFile?: File | null
}

interface Campaign {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  start_date?: string
  end_date?: string
  amount_per_vote?: number
  is_public?: boolean
  allow_anonymous_voting?: boolean
  max_votes_per_user?: number
  campaign_type: 'categorized' | 'simple'
  require_payment?: boolean
  payment_methods?: string[]
  auto_publish?: boolean
  allow_editing?: boolean
  show_vote_counts?: boolean
  show_voter_names?: boolean
  status?: string
  categories: Category[]
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
  { id: 1, title: 'Basic Info', icon: Settings },
  { id: 2, title: 'Campaign Settings', icon: Calendar },
  { id: 3, title: 'Voting & Payment', icon: CreditCard },
  { id: 4, title: 'Nominees', icon: Users },
  { id: 5, title: 'Review & Update', icon: CheckCircle }
]

export default function EditCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    coverImage: null,
    startDate: '',
    endDate: '',
    amountPerVote: 1,
    isPublic: true,
    allowAnonymousVoting: true,
    maxVotesPerUser: 999999, // Effectively unlimited
    campaignType: 'categorized',
    requirePayment: true,
    paymentMethods: ['PAYSTACK'],
    autoPublish: false,
    allowEditing: true,
    showVoteCounts: true,
    showVoterNames: true,
    categories: [{ name: '', nominees: [{ name: '', bio: '', image: null }] }],
    directNominees: [{ name: '', bio: '', image: null }]
  })
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Fetch campaign data
  useEffect(() => {
    if (user && campaignId && session?.access_token) {
      fetchCampaign()
    }
  }, [user, campaignId, session])

  // Debug form data changes
  useEffect(() => {
    console.log('Form data updated:', formData)
  }, [formData])

  const updateFormData = (field: keyof CampaignFormData, value: any) => {
    console.log(`Updating ${field} to:`, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== ''
      case 2:
        return formData.startDate // Only require start date, end date is optional
      case 3:
        return formData.amountPerVote > 0
      case 4:
        if (formData.campaignType === 'categorized') {
          return formData.categories.every(cat => 
            cat.name.trim() !== '' && 
            cat.nominees.length > 0 && 
            cat.nominees.every(nom => nom.name.trim() !== '')
          )
        } else {
          return formData.directNominees.length > 0 && 
            formData.directNominees.every(nom => nom.name.trim() !== '')
        }
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const fetchCampaign = async () => {
    try {
      setFetching(true)
      const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }

      const data = await response.json()
      const campaignData = data.campaign

      console.log('Fetched campaign data:', campaignData)
      setCampaign(campaignData)
      
      // Populate form data with campaign data
      console.log('Raw campaign data dates:', {
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        start_date_type: typeof campaignData.start_date,
        end_date_type: typeof campaignData.end_date,
        all_campaign_keys: Object.keys(campaignData)
      })

      // Format dates properly for HTML date inputs
      const formatDateForInput = (dateString: string | null | undefined) => {
        if (!dateString) {
          console.log('Date string is null/undefined:', dateString)
          return ''
        }
        try {
          const date = new Date(dateString)
          if (isNaN(date.getTime())) {
            console.log('Invalid date:', dateString)
            return ''
          }
          const formatted = date.toISOString().split('T')[0]
          console.log('Formatted date:', dateString, '->', formatted)
          return formatted
        } catch (error) {
          console.error('Date formatting error:', error, 'for date:', dateString)
          return ''
        }
      }

      const newFormData: CampaignFormData = {
        title: campaignData.title || '',
        description: campaignData.description || '',
        coverImage: null,
        startDate: formatDateForInput(campaignData.start_date),
        endDate: formatDateForInput(campaignData.end_date),
        amountPerVote: campaignData.amount_per_vote ? campaignData.amount_per_vote / 100 : 1, // Convert from pesewas to GHS
        isPublic: campaignData.is_public !== undefined ? campaignData.is_public : true,
        allowAnonymousVoting: campaignData.allow_anonymous_voting !== undefined ? campaignData.allow_anonymous_voting : true,
        maxVotesPerUser: campaignData.max_votes_per_user || 999999, // Effectively unlimited
        campaignType: campaignData.campaign_type || 'categorized',
        requirePayment: campaignData.require_payment !== undefined ? campaignData.require_payment : true,
        paymentMethods: campaignData.payment_methods && campaignData.payment_methods.length > 0 ? campaignData.payment_methods : ['PAYSTACK'],
        autoPublish: campaignData.auto_publish !== undefined ? campaignData.auto_publish : false,
        allowEditing: campaignData.allow_editing !== undefined ? campaignData.allow_editing : true,
        showVoteCounts: campaignData.show_vote_counts !== undefined ? campaignData.show_vote_counts : true,
        showVoterNames: campaignData.show_voter_names !== undefined ? campaignData.show_voter_names : true,
        categories: campaignData.categories && campaignData.categories.length > 0 ? campaignData.categories : [{ name: '', nominees: [{ name: '', bio: '', image: null }] }],
        directNominees: []
      }

      console.log('Formatted dates:', {
        startDate: newFormData.startDate,
        endDate: newFormData.endDate
      })
      
      console.log('Setting form data:', newFormData)
      setFormData(newFormData)
      setImagePreview(campaignData.cover_image)
      
      if (campaignData.campaign_type === 'simple') {
        // For simple campaigns, extract nominees from the "General" category
        const generalCategory = campaignData.categories.find((cat: any) => cat.name === 'General')
        if (generalCategory) {
          newFormData.directNominees = generalCategory.nominees.map((nom: any) => ({
            id: nom.id,
            name: nom.name,
            bio: nom.bio || '',
            image: nom.image
          }))
          setFormData(newFormData)
        }
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to fetch campaign')
      router.push('/organizer/campaigns')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      // Upload new cover image if changed
      let coverImageUrl = campaign?.cover_image || null
      if (formData.coverImage) {
        const coverFormData = new FormData()
        coverFormData.append('file', formData.coverImage)
        coverFormData.append('folder', 'campaigns')

        const coverResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: coverFormData,
        })

        if (!coverResponse.ok) {
          throw new Error('Failed to upload campaign cover image')
        }

        const coverData = await coverResponse.json()
        coverImageUrl = coverData.url
      }

      // Upload nominee images and prepare data
      let processedCategories = formData.categories
      let processedDirectNominees = formData.directNominees

      if (formData.campaignType === 'categorized') {
        // Process categorized nominees
        processedCategories = await Promise.all(
          formData.categories.map(async (category) => {
            const processedNominees = await Promise.all(
              category.nominees.map(async (nominee) => {
                let nomineeImageUrl = nominee.image
                
                // Upload new image if changed
                if (nominee.imageFile) {
                  const nomineeFormData = new FormData()
                  nomineeFormData.append('file', nominee.imageFile)
                  nomineeFormData.append('folder', 'nominees')

                  const nomineeResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session?.access_token}`,
                    },
                    body: nomineeFormData,
                  })

                  if (!nomineeResponse.ok) {
                    throw new Error(`Failed to upload nominee image for ${nominee.name}`)
                  }

                  const nomineeData = await nomineeResponse.json()
                  nomineeImageUrl = nomineeData.url
                }

                return {
                  ...nominee,
                  image: nomineeImageUrl
                }
              })
            )

            return {
              ...category,
              nominees: processedNominees
            }
          })
        )
      } else {
        // Process direct nominees
        processedDirectNominees = await Promise.all(
          formData.directNominees.map(async (nominee) => {
            let nomineeImageUrl = nominee.image
            
            // Upload new image if changed
            if (nominee.imageFile) {
              const nomineeFormData = new FormData()
              nomineeFormData.append('file', nominee.imageFile)
              nomineeFormData.append('folder', 'nominees')

              const nomineeResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session?.access_token}`,
                },
                body: nomineeFormData,
              })

              if (!nomineeResponse.ok) {
                throw new Error(`Failed to upload nominee image for ${nominee.name}`)
              }

              const nomineeData = await nomineeResponse.json()
              nomineeImageUrl = nomineeData.url
            }

            return {
              ...nominee,
              image: nomineeImageUrl
            }
          })
        )
      }

      // Debug: Log the form data before sending
      console.log('Form data debug:', {
        amountPerVote: formData.amountPerVote,
        convertedAmount: formData.amountPerVote * 100,
        title: formData.title
      })

      // Prepare campaign data
      const campaignData = {
        title: formData.title,
        description: formData.description || null,
        coverImage: coverImageUrl,
        startDate: formData.startDate,
        endDate: formData.endDate,
        amountPerVote: formData.amountPerVote * 100, // Convert GHS to pesewas
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
        categories: formData.campaignType === 'categorized' ? processedCategories : null,
        directNominees: formData.campaignType === 'simple' ? processedDirectNominees : null
      }

      // Update campaign
      const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update campaign')
      }

      toast.success('Campaign updated successfully!')
      router.push(`/organizer/campaigns/${campaignId}/view`)
      
    } catch (error) {
      console.error('Campaign update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Category management functions
  const addCategory = () => {
    updateFormData('categories', [...formData.categories, { name: '', nominees: [{ name: '', bio: '', image: null }] }])
  }

  const removeCategory = (index: number) => {
    if (formData.categories.length > 1) {
      updateFormData('categories', formData.categories.filter((_, i) => i !== index))
    }
  }

  const updateCategory = (index: number, field: keyof Category, value: string) => {
    const updatedCategories = formData.categories.map((cat, i) => 
      i === index ? { ...cat, [field]: value } : cat
    )
    updateFormData('categories', updatedCategories)
  }

  const addNominee = (categoryIndex: number) => {
    const updatedCategories = formData.categories.map((cat, i) => 
      i === categoryIndex 
        ? { ...cat, nominees: [...cat.nominees, { name: '', bio: '', image: null }] }
        : cat
    )
    updateFormData('categories', updatedCategories)
  }

  const removeNominee = (categoryIndex: number, nomineeIndex: number) => {
    const updatedCategories = formData.categories.map((cat, i) => 
      i === categoryIndex 
        ? { 
            ...cat, 
            nominees: cat.nominees.filter((_, j) => j !== nomineeIndex)
          }
        : cat
    )
    updateFormData('categories', updatedCategories)
  }

  const updateNominee = (categoryIndex: number, nomineeIndex: number, field: keyof Nominee, value: string) => {
    const updatedCategories = formData.categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat,
            nominees: cat.nominees.map((nom, j) => 
              j === nomineeIndex ? { ...nom, [field]: value } : nom
            )
          }
        : cat
    )
    updateFormData('categories', updatedCategories)
  }

  // Direct nominees functions
  const addDirectNominee = () => {
    updateFormData('directNominees', [...formData.directNominees, { name: '', bio: '', image: null }])
  }

  const removeDirectNominee = (index: number) => {
    if (formData.directNominees.length > 1) {
      updateFormData('directNominees', formData.directNominees.filter((_, i) => i !== index))
    }
  }

  const updateDirectNominee = (index: number, field: keyof Nominee, value: string) => {
    const updatedNominees = formData.directNominees.map((nom, i) => 
      i === index ? { ...nom, [field]: value } : nom
    )
    updateFormData('directNominees', updatedNominees)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      updateFormData('coverImage', file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNomineeImageChange = (categoryIndex: number, nomineeIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const updatedCategories = formData.categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat,
            nominees: cat.nominees.map((nom, j) => 
              j === nomineeIndex ? { ...nom, imageFile: file } : nom
            )
          }
        : cat
    )
    updateFormData('categories', updatedCategories)
  }

  const handleDirectNomineeImageChange = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const updatedNominees = formData.directNominees.map((nom, i) => 
      i === index ? { ...nom, imageFile: file } : nom
    )
    updateFormData('directNominees', updatedNominees)
  }

  const removeNomineeImage = (categoryIndex: number, nomineeIndex: number) => {
    const updatedCategories = formData.categories.map((cat, i) => 
      i === categoryIndex 
        ? {
            ...cat,
            nominees: cat.nominees.map((nom, j) => 
              j === nomineeIndex ? { ...nom, image: null, imageFile: null } : nom
            )
          }
        : cat
    )
    updateFormData('categories', updatedCategories)
  }

  const removeDirectNomineeImage = (index: number) => {
    const updatedNominees = formData.directNominees.map((nom, i) => 
      i === index ? { ...nom, image: null, imageFile: null } : nom
    )
    updateFormData('directNominees', updatedNominees)
  }

  const removeImage = () => {
    updateFormData('coverImage', null)
    setImagePreview(null)
  }

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading campaign...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !campaign) {
    return null
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Campaign title, description, and cover image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter campaign title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your campaign (optional)"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Campaign Structure</Label>
                <div className="flex space-x-6 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="categorized"
                      checked={formData.campaignType === 'categorized'}
                      onChange={(e) => updateFormData('campaignType', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">With Categories</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value="simple"
                      checked={formData.campaignType === 'simple'}
                      onChange={(e) => updateFormData('campaignType', e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Simple List</span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Cover Image</Label>
                <div className="mt-2">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="cover-image-upload"
                      />
                      <label htmlFor="cover-image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Cover image preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="max-w-4xl mx-auto">
              <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Campaign Settings</span>
              </CardTitle>
              <CardDescription>
                Dates, voting rules, and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      console.log('Start date changed to:', e.target.value)
                      updateFormData('startDate', e.target.value)
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current value: {formData.startDate || 'empty'}</p>
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      console.log('End date changed to:', e.target.value)
                      updateFormData('endDate', e.target.value)
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current value: {formData.endDate || 'empty'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Campaign</Label>
                      <p className="text-sm text-gray-500">Make this campaign visible to everyone</p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => updateFormData('isPublic', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Anonymous Voting</Label>
                      <p className="text-sm text-gray-500">Voters can vote without revealing their identity</p>
                    </div>
                    <Switch
                      checked={formData.allowAnonymousVoting}
                      onCheckedChange={(checked) => updateFormData('allowAnonymousVoting', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Vote Counts</Label>
                      <p className="text-sm text-gray-500">Display vote counts publicly</p>
                    </div>
                    <Switch
                      checked={formData.showVoteCounts}
                      onCheckedChange={(checked) => updateFormData('showVoteCounts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Voter Names</Label>
                      <p className="text-sm text-gray-500">Display voter names publicly</p>
                    </div>
                    <Switch
                      checked={formData.showVoterNames}
                      onCheckedChange={(checked) => updateFormData('showVoterNames', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="maxVotes">Maximum Votes Per User</Label>
                <Input
                  id="maxVotes"
                  type="number"
                  min="1"
                  value={formData.maxVotesPerUser}
                  onChange={(e) => updateFormData('maxVotesPerUser', parseInt(e.target.value))}
                  placeholder="999999"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to a very high number (999999) for unlimited votes
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Voting & Payment</span>
              </CardTitle>
                    <CardDescription>
                Vote costs, payment methods, and limits
                    </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Payment</Label>
                  <p className="text-sm text-gray-500">Voters must pay to cast votes</p>
                  </div>
                <Switch
                  checked={formData.requirePayment}
                  onCheckedChange={(checked) => updateFormData('requirePayment', checked)}
                />
              </div>

              {formData.requirePayment && (
                <>
                  <div>
                    <Label htmlFor="amountPerVote">Amount Per Vote (GHS) *</Label>
                    <Input
                      id="amountPerVote"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.amountPerVote}
                      onChange={(e) => updateFormData('amountPerVote', parseFloat(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Payment Methods</Label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.includes('PAYSTACK')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData('paymentMethods', [...formData.paymentMethods, 'PAYSTACK'])
                            } else {
                              updateFormData('paymentMethods', formData.paymentMethods.filter(m => m !== 'PAYSTACK'))
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Paystack</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.paymentMethods.includes('NALO')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFormData('paymentMethods', [...formData.paymentMethods, 'NALO'])
                            } else {
                              updateFormData('paymentMethods', formData.paymentMethods.filter(m => m !== 'NALO'))
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Nalo</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Publish</Label>
                  <p className="text-sm text-gray-500">Automatically publish when campaign is ready</p>
                </div>
                <Switch
                  checked={formData.autoPublish}
                  onCheckedChange={(checked) => updateFormData('autoPublish', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Editing</Label>
                  <p className="text-sm text-gray-500">Allow editing after campaign is published</p>
                </div>
                <Switch
                  checked={formData.allowEditing}
                  onCheckedChange={(checked) => updateFormData('allowEditing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Nominees</span>
              </CardTitle>
              <CardDescription>
                Add categories and nominees for voting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.campaignType === 'categorized' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Categories & Nominees</h3>
                  <Button type="button" onClick={addCategory} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>

                  {formData.categories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold">Category {categoryIndex + 1}</h4>
                        {formData.categories.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeCategory(categoryIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                        <Label>Category Name *</Label>
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                        placeholder="e.g., Best Actor, Best Movie"
                          className="mt-1"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                          <Label>Nominees *</Label>
                        <Button
                          type="button"
                          onClick={() => addNominee(categoryIndex)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Nominee
                        </Button>
                      </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {category.nominees.map((nominee, nomineeIndex) => (
                           <div key={nomineeIndex} className="flex items-start space-x-3 p-3 border rounded">
                             <div className="flex-1 space-y-3">
                               <Input
                                 value={nominee.name}
                                 onChange={(e) => updateNominee(categoryIndex, nomineeIndex, 'name', e.target.value)}
                                 placeholder="Nominee name"
                               />
                               <Textarea
                                 value={nominee.bio}
                                 onChange={(e) => updateNominee(categoryIndex, nomineeIndex, 'bio', e.target.value)}
                                 placeholder="Brief bio (optional)"
                                 rows={2}
                               />
                               
                               <div>
                                  <Label>Nominee Photo</Label>
                                 {!nominee.image && !nominee.imageFile ? (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors mt-1">
                                     <input
                                       type="file"
                                       accept="image/*"
                                       onChange={(e) => {
                                         const file = e.target.files?.[0]
                                         if (file) handleNomineeImageChange(categoryIndex, nomineeIndex, file)
                                       }}
                                       className="hidden"
                                       id={`nominee-image-${categoryIndex}-${nomineeIndex}`}
                                     />
                                      <label htmlFor={`nominee-image-${categoryIndex}-${nomineeIndex}`} className="cursor-pointer flex flex-col items-center space-y-2">
                                       <Upload className="w-6 h-6 text-gray-400" />
                                       <div>
                                          <p className="text-sm font-medium text-gray-600">Upload photo</p>
                                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                       </div>
                                     </label>
                                   </div>
                                 ) : (
                                    <div className="relative mt-1">
                                     <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                       <Image
                                         src={nominee.imageFile ? URL.createObjectURL(nominee.imageFile) : (nominee.image || '')}
                                         alt="Nominee photo"
                                         fill
                                         className="object-cover"
                                       />
                                     </div>
                                     <Button
                                       type="button"
                                       variant="outline"
                                       size="sm"
                                       onClick={() => removeNomineeImage(categoryIndex, nomineeIndex)}
                                       className="absolute -top-2 -right-2"
                                     >
                                       <X className="w-4 h-4" />
                                     </Button>
                                   </div>
                                 )}
                               </div>
                             </div>
                             {category.nominees.length > 1 && (
                               <Button
                                 type="button"
                                 onClick={() => removeNominee(categoryIndex, nomineeIndex)}
                                 variant="outline"
                                 size="sm"
                               >
                                 <X className="w-4 h-4" />
                               </Button>
                             )}
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}
                </div>
          ) : (
                <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Direct Nominees</h3>
                  <Button type="button" onClick={addDirectNominee} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Nominee
                  </Button>
                </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {formData.directNominees.map((nominee, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                          <h4 className="text-md font-semibold">Nominee {index + 1}</h4>
                          {formData.directNominees.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeDirectNominee(index)}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                                         <div className="space-y-3">
                       <Input
                         value={nominee.name}
                         onChange={(e) => updateDirectNominee(index, 'name', e.target.value)}
                         placeholder="Nominee name"
                       />
                       <Textarea
                         value={nominee.bio}
                         onChange={(e) => updateDirectNominee(index, 'bio', e.target.value)}
                         placeholder="Brief bio (optional)"
                         rows={2}
                       />
                       
                       <div>
                            <Label>Nominee Photo</Label>
                         {!nominee.image && !nominee.imageFile ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors mt-1">
                             <input
                               type="file"
                               accept="image/*"
                               onChange={(e) => {
                                 const file = e.target.files?.[0]
                                 if (file) handleDirectNomineeImageChange(index, file)
                               }}
                               className="hidden"
                               id={`direct-nominee-image-${index}`}
                             />
                                <label htmlFor={`direct-nominee-image-${index}`} className="cursor-pointer flex flex-col items-center space-y-2">
                               <Upload className="w-6 h-6 text-gray-400" />
                               <div>
                                    <p className="text-sm font-medium text-gray-600">Upload photo</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                               </div>
                             </label>
                           </div>
                         ) : (
                              <div className="relative mt-1">
                             <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                               <Image
                                 src={nominee.imageFile ? URL.createObjectURL(nominee.imageFile) : (nominee.image || '')}
                                 alt="Nominee photo"
                                 fill
                                 className="object-cover"
                               />
                             </div>
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => removeDirectNomineeImage(index)}
                               className="absolute -top-2 -right-2"
                             >
                               <X className="w-4 h-4" />
                             </Button>
                           </div>
                         )}
                       </div>
                     </div>
                  </div>
                ))}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
        )

      case 5:
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Review & Update</span>
              </CardTitle>
              <CardDescription>
                Review all settings before updating your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Campaign Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title}</p>
                    <p><strong>Description:</strong> {formData.description || 'None'}</p>
                    <p><strong>Type:</strong> {formData.campaignType === 'categorized' ? 'With Categories' : 'Simple List'}</p>
                    <p><strong>Start Date:</strong> {formData.startDate}</p>
                    <p><strong>End Date:</strong> {formData.endDate}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Voting Settings</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Amount per Vote:</strong> ₵{formData.amountPerVote}</p>
                    <p><strong>Max Votes per User:</strong> {formData.maxVotesPerUser}</p>
                    <p><strong>Public:</strong> {formData.isPublic ? 'Yes' : 'No'}</p>
                    <p><strong>Anonymous Voting:</strong> {formData.allowAnonymousVoting ? 'Yes' : 'No'}</p>
                    <p><strong>Show Vote Counts:</strong> {formData.showVoteCounts ? 'Yes' : 'No'}</p>
                    <p><strong>Show Voter Names:</strong> {formData.showVoterNames ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Nominees Summary</h4>
                {formData.campaignType === 'categorized' ? (
                  <div className="space-y-2">
                    {formData.categories.map((category, index) => (
                      <p key={index} className="text-sm">
                        <strong>{category.name}:</strong> {category.nominees.length} nominees
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm"><strong>Total Nominees:</strong> {formData.directNominees.length}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <Link href="/organizer/campaigns" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Edit Campaign</h1>
            <p className="text-muted-foreground mt-2">
              Update your voting campaign details
            </p>
          </div>

          {/* Stepper */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                const Icon = step.icon

                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Protection Status Section */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto mt-8">
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-700">
                    <Shield className="w-5 h-5" />
                    <span>Campaign Protection Status</span>
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    View protection status and manage nominee evictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Link href={`/organizer/campaigns/${campaignId}/protection`}>
                      <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                        <Shield className="w-4 h-4 mr-2" />
                        View Protection Status
              </Button>
            </Link>
                    <Link href={`/organizer/campaigns/${campaignId}/nominees/evicted`}>
                      <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Evicted Nominees
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="max-w-4xl mx-auto mt-8 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={loading}>
              {loading ? 'Updating Campaign...' : 'Update Campaign'}
            </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
