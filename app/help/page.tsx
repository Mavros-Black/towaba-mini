"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle, BookOpen, MessageCircle, Phone, Mail, FileText, Users, Settings, CreditCard, Shield } from 'lucide-react'

export default function HelpCenterPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: BookOpen,
      articles: [
        "How to create your first campaign",
        "Setting up your organizer account",
        "Understanding voting options",
        "Campaign management basics"
      ]
    },
    {
      title: "Campaign Management",
      icon: Settings,
      articles: [
        "Adding and managing nominees",
        "Setting voting periods",
        "Campaign protection features",
        "Analytics and reporting"
      ]
    },
    {
      title: "Payments & Billing",
      icon: CreditCard,
      articles: [
        "Payment methods accepted",
        "Understanding pricing plans",
        "Billing and invoicing",
        "Refund policy"
      ]
    },
    {
      title: "Security & Privacy",
      icon: Shield,
      articles: [
        "Data protection measures",
        "Vote security and integrity",
        "Privacy settings",
        "Account security"
      ]
    },
    {
      title: "Troubleshooting",
      icon: HelpCircle,
      articles: [
        "Common issues and solutions",
        "Browser compatibility",
        "Mobile app problems",
        "Performance issues"
      ]
    },
    {
      title: "Account & Profile",
      icon: Users,
      articles: [
        "Managing your profile",
        "Account settings",
        "Password and security",
        "Deleting your account"
      ]
    }
  ]

  const popularArticles = [
    "How to create a voting campaign",
    "Setting up payment methods",
    "Understanding vote limits",
    "Campaign analytics explained",
    "Troubleshooting login issues",
    "Mobile money payment setup"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 py-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Find answers to your questions and get the support you need to make the most of Towaba.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search for help articles, guides, or topics..."
                className="pl-12 pr-4 py-3 text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">Get instant help from our support team</p>
                <Button variant="outline" className="w-full">Start Chat</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">Send us a detailed message</p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-4">Call us for urgent issues</p>
                <Button variant="outline" className="w-full">Call Now</Button>
              </CardContent>
            </Card>
          </div>

          {/* Popular Articles */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm hover:text-primary transition-colors">{article}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <category.icon className="w-6 h-6 mr-3 text-primary" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                          {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@towaba.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+233 24 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM GMT</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Usually within 5 minutes</p>
                </div>
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">Within 24 hours</p>
                </div>
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">Immediate during business hours</p>
                </div>
                <div>
                  <p className="font-medium">Enterprise Support</p>
                  <p className="text-sm text-muted-foreground">Priority response within 2 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Still Need Help */}
          <div className="text-center p-8 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Contact Support
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
