"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, Heart, TrendingUp, Calendar, MapPin, Globe, Award, Star, ThumbsUp } from 'lucide-react'

export default function CommunityPage() {
  const communityStats = [
    { label: "Active Members", value: "2,500+", icon: Users },
    { label: "Campaigns Created", value: "15,000+", icon: TrendingUp },
    { label: "Votes Cast", value: "500,000+", icon: Heart },
    { label: "Countries", value: "25+", icon: Globe }
  ]

  const upcomingEvents = [
    {
      title: "Community Meetup - Accra",
      date: "March 15, 2024",
      location: "Accra, Ghana",
      attendees: 45,
      type: "In-Person"
    },
    {
      title: "Voting Best Practices Webinar",
      date: "March 20, 2024",
      location: "Online",
      attendees: 120,
      type: "Virtual"
    },
    {
      title: "Platform Updates Q&A",
      date: "March 25, 2024",
      location: "Online",
      attendees: 85,
      type: "Virtual"
    }
  ]

  const featuredStories = [
    {
      title: "How University of Ghana Used Towaba for Student Elections",
      author: "Dr. Sarah Mensah",
      organization: "University of Ghana",
      excerpt: "Learn how we successfully conducted transparent student union elections with over 10,000 votes...",
      likes: 24,
      comments: 8,
      readTime: "5 min read"
    },
    {
      title: "Organizing a Charity Fundraiser with Towaba",
      author: "Kwame Asante",
      organization: "Hope Foundation",
      excerpt: "Discover how we raised awareness and funds through a creative voting campaign that engaged our community...",
      likes: 18,
      comments: 12,
      readTime: "7 min read"
    },
    {
      title: "Best Practices for Event Voting",
      author: "Ama Serwaa",
      organization: "Event Pro Ghana",
      excerpt: "A comprehensive guide to setting up successful voting campaigns for events of all sizes...",
      likes: 31,
      comments: 15,
      readTime: "10 min read"
    }
  ]

  const communityGuidelines = [
    "Be respectful and inclusive in all interactions",
    "Share knowledge and help fellow community members",
    "Provide constructive feedback and suggestions",
    "Respect privacy and confidentiality",
    "Follow platform terms of service",
    "Report inappropriate behavior or content"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 py-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Towaba Community
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Connect with fellow organizers, share experiences, and learn from the best practices of our growing community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Join Community
              </Button>
              <Button size="lg" variant="outline">
                View Guidelines
              </Button>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {communityStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Community Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-primary" />
                  Discussion Forums
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join conversations about voting best practices, platform features, and event organization tips.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• General discussions</li>
                  <li>• Feature requests</li>
                  <li>• Troubleshooting help</li>
                  <li>• Success stories</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  User Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Connect with organizers in your region or industry through specialized user groups.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Educational institutions</li>
                  <li>• Corporate events</li>
                  <li>• Non-profit organizations</li>
                  <li>• Regional communities</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-6 h-6 mr-3 text-primary" />
                  Recognition Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get recognized for your contributions and help others by sharing your expertise.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Community badges</li>
                  <li>• Featured success stories</li>
                  <li>• Expert contributor status</li>
                  <li>• Early access to features</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant={event.type === "In-Person" ? "default" : "secondary"}>
                        {event.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {event.attendees} attendees
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      Register
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Stories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
            <div className="space-y-6">
              {featuredStories.map((story, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          By {story.author} • {story.organization}
                        </p>
                        <p className="text-sm text-muted-foreground">{story.readTime}</p>
                      </div>
                      <Badge variant="outline">Featured</Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{story.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {story.likes}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {story.comments}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Help us maintain a positive and productive community environment:
                </p>
                <ul className="space-y-2">
                  {communityGuidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <Star className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Involved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  There are many ways to contribute to our community:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Share your success stories</li>
                  <li>• Help answer questions in forums</li>
                  <li>• Provide feedback on new features</li>
                  <li>• Organize local meetups</li>
                  <li>• Contribute to documentation</li>
                  <li>• Report bugs and issues</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Join CTA */}
          <div className="text-center p-8 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-muted-foreground mb-6">
              Connect with thousands of organizers, share your experiences, and learn from the best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Join Now
              </Button>
              <Button size="lg" variant="outline">
                Browse Forums
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
