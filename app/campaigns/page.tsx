"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  organizer_id: string
  created_at: string
  updated_at: string
  organizer?: {
    name: string
  }
  _count?: {
    categories: number
    nominees: number
  }
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/campaigns/public')
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading campaigns...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Campaigns</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCampaigns}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Full Width */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-green-900/20 dark:to-slate-800"></div>
        {/* Background Design */}
        <div className="absolute inset-0 opacity-30">
          {/* Organic Shapes */}
          <div className="absolute top-16 left-16 w-36 h-36 bg-green-500 rounded-full blur-3xl"></div>
          <div className="absolute top-24 right-24 w-28 h-28 bg-emerald-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-24 left-1/3 w-44 h-44 bg-teal-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-16 right-1/4 w-32 h-32 bg-lime-500 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-12 w-24 h-24 bg-green-400 rounded-full blur-xl"></div>
          <div className="absolute top-1/3 right-12 w-20 h-20 bg-emerald-400 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-teal-400 rounded-full blur-xl"></div>
          <div className="absolute top-2/3 right-1/4 w-16 h-16 bg-lime-400 rounded-full blur-lg"></div>
          <div className="absolute top-1/4 left-1/3 w-22 h-22 bg-green-300 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/4 right-1/3 w-18 h-18 bg-emerald-300 rounded-full blur-lg"></div>
        </div>
        <div className="relative px-8 py-32 text-center text-slate-800 dark:text-white">
          <h1 className="text-5xl font-bold tracking-tight mb-4">Campaigns</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover and participate in exciting voting campaigns from around the world
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8">

        {/* Search and Filters Section */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Field */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Categories</option>
                <option value="beauty">Beauty</option>
                <option value="talent">Talent</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Sort By</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>

              <button className="px-4 py-3 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No campaigns yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back later for exciting voting campaigns!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video bg-muted rounded-t-lg mb-4 flex items-center justify-center">
                  {(campaign as any).image_url ? (
                    <img
                      src={(campaign as any).image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">Cover Image</div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ACTIVE
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {campaign._count?.categories || 0} Categories | {campaign._count?.nominees || 0} Nominees
                    </span>
                  </div>
                  <CardTitle className="text-xl">{campaign.title}</CardTitle>
                  <CardDescription className="text-muted-foreground line-clamp-2">
                    {campaign.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created: {new Date(campaign.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {campaign.organizer?.name || 'Unknown Organizer'}
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button className="w-full">View Campaign</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
