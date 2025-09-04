"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Award, Loader2, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { VotingModal } from '@/components/voting-modal'
import { supabase } from '@/lib/supabase'

interface Nominee {
  id: string
  name: string
  bio: string | null
  image: string | null
  votes_count: number
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  nominees: Nominee[]
}

interface Campaign {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  created_at: string
  organizer: {
    name: string
  }
  categories: Category[]
}

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [realTimeUpdates, setRealTimeUpdates] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
      setupRealTimeSubscription()
    }

    return () => {
      // Cleanup subscription
      if (campaignId) {
        supabase.removeAllChannels()
      }
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch campaign')
      }
      const data = await response.json()
      setCampaign(data.campaign)
      
      // Initialize real-time updates with current vote counts
      const initialUpdates: {[key: string]: number} = {}
      data.campaign.categories.forEach((category: Category) => {
        category.nominees.forEach((nominee: Nominee) => {
          initialUpdates[nominee.id] = nominee.votes_count
        })
      })
      setRealTimeUpdates(initialUpdates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaign')
    } finally {
      setLoading(false)
    }
  }

  const setupRealTimeSubscription = () => {
    // Subscribe to real-time updates on nominees table
    const nomineesSubscription = supabase
      .channel('nominees-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'nominees',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Real-time nominee update:', payload)
          const nominee = payload.new as any
          if (nominee && nominee.votes_count !== undefined) {
            setRealTimeUpdates(prev => ({
              ...prev,
              [nominee.id]: nominee.votes_count
            }))
            
            // Show a subtle notification for new votes
            showVoteNotification(nominee.name, nominee.votes_count)
          }
        }
      )
      .subscribe()

    // Subscribe to real-time updates on votes table
    const votesSubscription = supabase
      .channel('votes-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          console.log('Real-time vote insert:', payload)
          const vote = payload.new as any
          if (vote && vote.nominee_id) {
            // Trigger a refresh of the specific nominee's vote count
            refreshNomineeVoteCount(vote.nominee_id)
          }
        }
      )
      .subscribe()

    return () => {
      nomineesSubscription.unsubscribe()
      votesSubscription.unsubscribe()
    }
  }

  const refreshNomineeVoteCount = async (nomineeId: string) => {
    try {
      const { data, error } = await supabase
        .from('nominees')
        .select('votes_count')
        .eq('id', nomineeId)
        .single()
      
      if (!error && data) {
        setRealTimeUpdates(prev => ({
          ...prev,
          [nomineeId]: data.votes_count
        }))
      }
    } catch (err) {
      console.error('Failed to refresh nominee vote count:', err)
    }
  }

  const showVoteNotification = (nomineeName: string, newCount: number) => {
    // Create a subtle floating notification
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <TrendingUp class="w-4 h-4" />
        <span>${nomineeName} just got a vote! 🎉</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }

  const handleVote = (nominee: Nominee) => {
    setSelectedNominee(nominee)
    setShowVotingModal(true)
  }

  const handleVoteSuccess = () => {
    setShowVotingModal(false)
    // Refresh campaign data to show updated vote counts
    fetchCampaign()
  }

  // Get the real-time vote count for a nominee
  const getRealTimeVoteCount = (nomineeId: string, fallbackCount: number) => {
    return realTimeUpdates[nomineeId] !== undefined ? realTimeUpdates[nomineeId] : fallbackCount
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-lg">Loading campaign...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The campaign you are looking for does not exist.'}</p>
            <Link href="/campaigns">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Campaign Header */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          {campaign.cover_image && (
            <img
              src={campaign.cover_image}
              alt={campaign.title}
              className="w-full h-full object-cover opacity-20"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <Link href="/campaigns">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4 transition-all duration-700 hover:scale-[1.02]">
                <ArrowLeft className="w-4 h-4 mr-2 animate-[pulse_3s_ease-in-out_infinite]" />
                Back to Campaigns
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {campaign.title} - Nominees
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Vote for your favorite nominees in {campaign.organizer.name}
              </p>
              <div className="flex items-center justify-center space-x-6 mt-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Organized by {campaign.organizer.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="grid gap-8">
          {campaign.categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl">{category.name}</CardTitle>
                  <Badge variant="secondary">
                    {category.nominees.length} Nominees
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.nominees.map((nominee, nomineeIndex) => {
                    const realTimeVoteCount = getRealTimeVoteCount(nominee.id, nominee.votes_count)
                    const isVoteCountUpdating = realTimeVoteCount !== nominee.votes_count
                    
                    return (
                      <Card key={nominee.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        {/* Gradient Header with Real-Time Vote Count Badge */}
                        <div className={`relative h-40 ${
                          nomineeIndex % 3 === 0 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : nomineeIndex % 3 === 1
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                            : 'bg-gradient-to-r from-pink-500 to-red-500'
                        }`}>
                          {/* Real-Time Vote Count Badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <Badge 
                              variant="secondary" 
                              className={`bg-white/20 text-white border-0 px-3 py-1 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                                isVoteCountUpdating ? 'animate-pulse bg-green-400/30' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-1">
                                {isVoteCountUpdating && <TrendingUp className="w-3 h-3 animate-bounce" />}
                                <span>{realTimeVoteCount.toLocaleString()} votes</span>
                              </div>
                            </Badge>
                          </div>
                          
                          {/* Nominee Image or Placeholder */}
                          <div className="absolute inset-0">
                            {nominee.image ? (
                              <img
                                src={nominee.image}
                                alt={nominee.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-16 h-16 text-white/60" />
                              </div>
                            )}
                          </div>
                          
                          {/* Subtle overlay for better readability */}
                          <div className="absolute inset-0 bg-black/10"></div>
                        </div>

                        {/* Nominee Details */}
                        <div className="p-6 bg-white">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{nominee.name}</h3>
                          
                          {nominee.bio && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {nominee.bio}
                            </p>
                          )}

                          {/* Real-Time Vote Info and Date */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4" />
                              <span className={isVoteCountUpdating ? 'text-green-600 font-semibold' : ''}>
                                {realTimeVoteCount.toLocaleString()} votes
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Vote Button */}
                          <Button 
                            onClick={() => handleVote(nominee)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                            size="sm"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Vote for {nominee.name}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Voting Modal */}
      {selectedNominee && showVotingModal && (
        <VotingModal
          isOpen={showVotingModal}
          onClose={() => setShowVotingModal(false)}
          nominee={selectedNominee}
          campaign={campaign}
        />
      )}
    </div>
  )
}
