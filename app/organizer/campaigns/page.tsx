"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Users, Award, Loader2, Edit, Trash2, Eye, Globe, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { DashboardWrapper } from '@/components/dashboard-wrapper'
import Image from 'next/image'

interface Campaign {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  created_at: string
  status: string
  _count: {
    categories: number
    nominees: number
  }
}

export default function OrganizerCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
        return
      }
      fetchCampaigns()
    }
  }, [user, authLoading, router])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/organizer/campaigns', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      console.log('Campaigns data received:', data.campaigns?.map((c: any) => ({ id: c.id, title: c.title, status: c.status })))
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = () => {
    router.push('/organizer/campaigns/create')
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will permanently delete the campaign, all categories, nominees, votes, and payments. This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete campaign')
      }

      toast.success('Campaign deleted successfully')
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete campaign')
    }
  }

  const handlePublishCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to publish this campaign? Once published, it will be visible to the public and voting will begin.')) {
      return
    }

    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish campaign')
      }

      toast.success('Campaign published successfully!')
      fetchCampaigns() // Refresh the list
    } catch (error) {
      console.error('Error publishing campaign:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish campaign')
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardWrapper title="Campaigns">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading campaigns...</span>
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper title="Campaigns">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Manage your voting campaigns and nominees
          </p>
        </div>
        <Button onClick={handleCreateCampaign}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first voting campaign to get started
              </p>
              <Button onClick={handleCreateCampaign}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => {
              console.log('Rendering campaign:', { id: campaign.id, title: campaign.title, status: campaign.status, shouldShowPublish: (campaign.status === 'DRAFT' || !campaign.status || campaign.status === null) })
              return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Cover Image */}
                        <div className="flex-shrink-0">
                          {campaign.cover_image ? (
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                              <Image
                                src={campaign.cover_image}
                                alt={campaign.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                              <Award className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-xl font-semibold text-foreground">
                              {campaign.title}
                            </h3>
                            <Badge 
                              variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                              className={campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {campaign.status === 'ACTIVE' ? 'Published' : 'Draft'}
                            </Badge>
                            <Badge variant="secondary">
                              {campaign._count.categories} Categories
                            </Badge>
                            <Badge variant="outline">
                              {campaign._count.nominees} Nominees
                            </Badge>
                            {/* Debug info */}
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Status: {campaign.status || 'NULL'}
                            </Badge>
                          </div>
                          
                          {campaign.description && (
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                                         <div className="flex items-center space-x-2 ml-4">
                       {/* Debug: Always show publish button for testing */}
                       <Button 
                         variant="default" 
                         size="sm"
                         onClick={() => handlePublishCampaign(campaign.id)}
                         className="bg-green-600 hover:bg-green-700"
                       >
                         <Globe className="w-4 h-4 mr-1" />
                         Publish (Debug)
                       </Button>
                       {(campaign.status === 'DRAFT' || !campaign.status || campaign.status === null) && (
                         <Button 
                           variant="default" 
                           size="sm"
                           onClick={() => handlePublishCampaign(campaign.id)}
                           className="bg-blue-600 hover:bg-blue-700"
                         >
                           <Globe className="w-4 h-4 mr-1" />
                           Publish (Conditional)
                         </Button>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => router.push(`/organizer/campaigns/${campaign.id}/edit`)}
                       >
                         <Edit className="w-4 h-4" />
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleDeleteCampaign(campaign.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                       <Button 
                         size="sm"
                         onClick={() => router.push(`/organizer/campaigns/${campaign.id}/view`)}
                       >
                         <Eye className="w-4 h-4 mr-2" />
                         View
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardWrapper>
  )
}
