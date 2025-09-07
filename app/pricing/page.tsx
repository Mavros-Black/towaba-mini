"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star, Zap, Crown, Users, TrendingUp } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small events and testing",
      icon: Users,
      features: [
        "Up to 100 votes per campaign",
        "Basic campaign management",
        "Email support",
        "Standard voting options",
        "Basic analytics",
        "Mobile responsive design"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "₵50",
      period: "/campaign",
      description: "Ideal for medium-sized events and organizations",
      icon: Zap,
      features: [
        "Up to 1,000 votes per campaign",
        "Advanced campaign management",
        "Priority email support",
        "Custom voting options",
        "Detailed analytics & reports",
        "Payment processing integration",
        "Campaign protection features",
        "Export data functionality"
      ],
      cta: "Choose Professional",
      popular: true
    },
    {
      name: "Enterprise",
      price: "₵200",
      period: "/month",
      description: "For large organizations and high-volume events",
      icon: Crown,
      features: [
        "Unlimited votes per campaign",
        "Full campaign management suite",
        "24/7 phone & email support",
        "Custom branding options",
        "Advanced analytics & insights",
        "API access",
        "White-label solutions",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your voting needs. Start free and scale as you grow.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                Secure payments
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-primary" />
                  Pay Per Campaign
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our Professional plan is perfect for event organizers who want to pay only for what they use. 
                  Each campaign is charged separately, so you only pay when you create a voting campaign.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>No monthly commitments</li>
                  <li>Pay only when you create campaigns</li>
                  <li>Full features for each campaign</li>
                  <li>Perfect for occasional events</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  Enterprise Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Need something custom? Our Enterprise plan offers unlimited campaigns, 
                  custom branding, API access, and dedicated support for large organizations.
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Custom integrations</li>
                  <li>White-label solutions</li>
                  <li>Dedicated account manager</li>
                  <li>SLA guarantee</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>How does the free plan work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The free plan allows you to create campaigns with up to 100 votes each. 
                  It's perfect for small events, testing, or personal use. No credit card required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards, mobile money (MTN, Vodafone, AirtelTigo), 
                  and bank transfers. All payments are processed securely through our payment partners.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I upgrade or downgrade anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. 
                  Changes take effect immediately, and we'll prorate any billing differences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Is there a setup fee?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No setup fees, no hidden costs. You only pay for the plan you choose. 
                  Enterprise customers may have custom setup requirements that we'll discuss during onboarding.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 p-8 bg-muted rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of organizers who trust Towaba for their voting needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

