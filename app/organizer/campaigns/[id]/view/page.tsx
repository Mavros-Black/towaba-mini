"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Users, Award, Loader2, Edit, Eye, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  nominees: Nominee[]
}

interface Nominee {
  id: string
  name: string
  bio: string | null
  image: string | null
  votes_count?: number
}

interface Campaign {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  start_date?: string | null
  end_date?: string | null
  amount_per_vote?: number | null
  is_public?: boolean | null
  allow_anonymous_voting?: boolean | null
  max_votes_per_user?: number | null
  campaign_type?: string | null
  require_payment?: boolean | null
  payment_methods?: string[] | null
  auto_publish?: boolean | null
  allow_editing?: boolean | null
  show_vote_counts?: boolean | null
  show_voter_names?: boolean | null
  status?: string | null
  created_at: string
  categories: Category[]
}

export default function CampaignViewPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      fetchCampaign()
    }
  }, [user, authLoading, router, campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }
      const data = await response.json()
      console.log('Full campaign data received:', data)
      console.log('Amount per vote debug:', {
        raw_value: data.campaign.amount_per_vote,
        display_value: data.campaign.amount_per_vote ? (data.campaign.amount_per_vote / 100).toFixed(2) : 'null',
        require_payment: data.campaign.require_payment
      })
      setCampaign(data.campaign)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/organizer/campaigns/${campaignId}/edit`)
  }

  if (authLoading || loading) {
    return (
      <DashboardWrapper title="Viewing Campaign">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading campaign...</span>
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  if (!campaign) {
    return (
      <DashboardWrapper title="Campaign Not Found">
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Campaign not found</h2>
          <Button onClick={() => router.push('/organizer/campaigns')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper title={campaign.title}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/organizer/campaigns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
            <p className="text-muted-foreground mt-2">
              Campaign details and nominees
            </p>
          </div>
          
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cover Image */}
              {campaign.cover_image && (
                <div className="mb-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={campaign.cover_image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              
              {campaign.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{campaign.description}</p>
                </div>
              )}
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span><strong>Created:</strong> {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
                {campaign.start_date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span><strong>Start Date:</strong> {new Date(campaign.start_date).toLocaleDateString()}</span>
                  </div>
                )}
                {campaign.end_date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span><strong>End Date:</strong> {new Date(campaign.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span><strong>Type:</strong> {campaign.categories.length > 0 ? 'Categorized' : 'Simple'}</span>
                </div>
              </div>

              {/* Campaign Settings */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Campaign Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Public Campaign:</span>
                    <Badge variant={campaign.is_public !== false ? "default" : "secondary"}>
                      {campaign.is_public !== false ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Anonymous Voting:</span>
                    <Badge variant={campaign.allow_anonymous_voting !== false ? "default" : "secondary"}>
                      {campaign.allow_anonymous_voting !== false ? "Allowed" : "Not Allowed"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Show Vote Counts:</span>
                    <Badge variant={campaign.show_vote_counts !== false ? "default" : "secondary"}>
                      {campaign.show_vote_counts !== false ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Show Voter Names:</span>
                    <Badge variant={campaign.show_voter_names !== false ? "default" : "secondary"}>
                      {campaign.show_voter_names !== false ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Allow Editing:</span>
                    <Badge variant={campaign.allow_editing !== false ? "default" : "secondary"}>
                      {campaign.allow_editing !== false ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto Publish:</span>
                    <Badge variant={campaign.auto_publish ? "default" : "secondary"}>
                      {campaign.auto_publish ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Voting & Payment Settings */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Voting & Payment Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Required:</span>
                    <Badge variant={campaign.require_payment !== false ? "default" : "secondary"}>
                      {campaign.require_payment !== false ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {campaign.require_payment !== false && campaign.amount_per_vote && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount per Vote:</span>
                      <Badge variant="outline">
                        {(campaign.amount_per_vote / 100).toFixed(2)} GHS
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Votes per User:</span>
                    <Badge variant="outline">
                      {campaign.max_votes_per_user || 'Unlimited'}
                    </Badge>
                  </div>
                  {campaign.payment_methods && campaign.payment_methods.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Methods:</span>
                      <div className="flex gap-1">
                        {campaign.payment_methods.map((method, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={campaign.status === 'ACTIVE' ? "default" : "secondary"}>
                  {campaign.status || 'DRAFT'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categories</span>
                <Badge variant="secondary">
                  {campaign.categories.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Nominees</span>
                <Badge variant="outline">
                  {campaign.categories.reduce((sum, cat) => sum + cat.nominees.length, 0)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleEdit} className="w-full" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Campaign Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaign.categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaign.categories.reduce((sum, cat) => sum + cat.nominees.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Nominees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaign.require_payment !== false ? `${((campaign.amount_per_vote || 100) / 100).toFixed(2)} GHS` : 'Free'}
                </div>
                <div className="text-sm text-muted-foreground">Per Vote</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {campaign.max_votes_per_user || '∞'}
                </div>
                <div className="text-sm text-muted-foreground">Max per User</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Nominees */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Categories & Nominees</h2>
        
        {campaign.categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>{category.name}</span>
                <Badge variant="outline">
                  {category.nominees.length} nominees
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category.nominees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No nominees in this category yet
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.nominees.map((nominee) => (
                    <Card key={nominee.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {nominee.image && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden">
                              <Image
                                src={nominee.image}
                                alt={nominee.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-foreground">{nominee.name}</h4>
                            {nominee.bio && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {nominee.bio}
                              </p>
                            )}
                                                          <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{nominee.votes_count || 0} votes</span>
                                </div>
                              </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardWrapper>
  )
}
