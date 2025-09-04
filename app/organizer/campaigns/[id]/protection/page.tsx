"use client"

import React, { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardNavbar } from '@/components/dashboard-navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Users, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { NomineeEvictionPanel } from '@/components/nominee-eviction-panel'

interface ProtectionStatus {
  campaign: {
    id: string
    title: string
    hasVotes: boolean
    voteCount: number
    canDelete: boolean
    canChangeStructure: boolean
    canMakePrivate: boolean
    protectionReason: string
  }
  nominees: Array<{
    id: string
    name: string
    categoryName: string
    hasVotes: boolean
    voteCount: number
    canDelete: boolean
    protectionReason: string
  }>
  categories: Array<{
    id: string
    name: string
    hasVotes: boolean
    voteCount: number
    canDelete: boolean
    protectionReason: string
  }>
  summary: {
    totalVotes: number
    protectedNominees: number
    protectedCategories: number
    isFullyProtected: boolean
    canModifyStructure: boolean
  }
}

export default function CampaignProtectionPage() {
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, session, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && campaignId && session?.access_token) {
      fetchCampaign()
      fetchProtectionStatus()
    }
  }, [user, campaignId, session])

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`/api/organizer/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }

      const data = await response.json()
      setCampaign(data.campaign)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      router.push('/organizer/campaigns')
    }
  }

  const fetchProtectionStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/organizer/campaigns/${campaignId}/protection`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch protection status')
      }

      const data = await response.json()
      setProtectionStatus(data.protection)
    } catch (error) {
      console.error('Error fetching protection status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading protection status...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !campaign || !protectionStatus) {
    return null
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
            <h1 className="text-3xl font-bold text-foreground">Campaign Protection Status</h1>
            <p className="text-muted-foreground mt-2">
              {campaign.title} - Protection and eviction management
            </p>
          </div>

          <div className="space-y-6">
            {/* Campaign Protection Status */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Campaign Protection</span>
                </CardTitle>
                <CardDescription>
                  Overall protection status for {campaign.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {protectionStatus.campaign.voteCount}
                    </div>
                    <div className="text-sm text-blue-600">Total Votes</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {protectionStatus.summary.protectedNominees}
                    </div>
                    <div className="text-sm text-orange-600">Protected Nominees</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {protectionStatus.summary.protectedCategories}
                    </div>
                    <div className="text-sm text-purple-600">Protected Categories</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {protectionStatus.summary.isFullyProtected ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-green-600">Fully Protected</div>
                  </div>
                </div>

                <Alert className={`mt-4 ${protectionStatus.campaign.hasVotes ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
                  {protectionStatus.campaign.hasVotes ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={protectionStatus.campaign.hasVotes ? 'text-orange-800' : 'text-green-800'}>
                    <strong>{protectionStatus.campaign.protectionReason}</strong>
                    {protectionStatus.campaign.hasVotes && (
                      <div className="mt-2 text-sm">
                        <p>• Campaign structure cannot be changed</p>
                        <p>• Nominees with votes can only be evicted (hidden)</p>
                        <p>• Campaign cannot be deleted</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Nominee Eviction Management */}
            <NomineeEvictionPanel
              campaignId={campaignId}
              campaignTitle={campaign.title}
              nominees={protectionStatus.nominees.map(n => ({
                id: n.id,
                name: n.name,
                bio: '',
                image: null,
                votes_count: n.voteCount,
                category_name: n.categoryName,
                is_evicted: false
              }))}
              onNomineeUpdate={fetchProtectionStatus}
            />

            {/* Nominees Protection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Nominees Protection Status</span>
                </CardTitle>
                <CardDescription>
                  Individual protection status for each nominee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protectionStatus.nominees.map((nominee) => (
                    <div key={nominee.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{nominee.name}</h4>
                        {nominee.hasVotes ? (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Protected</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Unprotected</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{nominee.categoryName}</p>
                      <div className="text-sm">
                        <p><strong>Votes:</strong> {nominee.voteCount}</p>
                        <p><strong>Status:</strong> {nominee.protectionReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Categories Protection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Categories Protection Status</span>
                </CardTitle>
                <CardDescription>
                  Protection status for each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {protectionStatus.categories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{category.name}</h4>
                        {category.hasVotes ? (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Protected</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Unprotected</span>
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <p><strong>Votes:</strong> {category.voteCount}</p>
                        <p><strong>Status:</strong> {category.protectionReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
