"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cookie, Settings, Eye, Shield, Database, Globe } from 'lucide-react'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 py-16">
            <div className="flex items-center justify-center mb-6">
              <Cookie className="w-12 h-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold">Cookie Policy</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Learn about how we use cookies and similar technologies on our platform.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* What Are Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cookie className="w-6 h-6 mr-3 text-primary" />
                  What Are Cookies?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling certain functionality.
                </p>
                <p className="text-muted-foreground">
                  We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period of time).
                </p>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-primary" />
                  Types of Cookies We Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Essential Cookies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Essential Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are necessary for the website to function properly and cannot be disabled.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Authentication and login status</li>
                    <li>Security and fraud prevention</li>
                    <li>Basic website functionality</li>
                    <li>Load balancing and performance</li>
                  </ul>
                </div>

                {/* Functional Cookies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    Functional Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies enhance your experience by remembering your preferences and settings.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Language and region preferences</li>
                    <li>Theme settings (light/dark mode)</li>
                    <li>User interface customizations</li>
                    <li>Form data and preferences</li>
                  </ul>
                </div>

                {/* Analytics Cookies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-purple-600" />
                    Analytics Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Error tracking and debugging</li>
                    <li>Performance monitoring</li>
                  </ul>
                </div>

                {/* Marketing Cookies */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-orange-600" />
                    Marketing Cookies
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Ad targeting and personalization</li>
                    <li>Campaign performance tracking</li>
                    <li>Social media integration</li>
                    <li>Retargeting and remarketing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Third-Party Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-primary" />
                  Third-Party Cookies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may use third-party services that set their own cookies. These include:
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Payment Processors</h3>
                    <p className="text-muted-foreground">
                      Services like Paystack may set cookies to process payments securely and prevent fraud.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Analytics Services</h3>
                    <p className="text-muted-foreground">
                      We may use services like Google Analytics to understand website usage and improve our platform.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Social Media</h3>
                    <p className="text-muted-foreground">
                      Social media platforms may set cookies when you interact with their content on our site.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-primary" />
                  Managing Your Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p className="text-muted-foreground mb-2">
                    You can control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>View and delete existing cookies</li>
                    <li>Block cookies from specific websites</li>
                    <li>Block all cookies (though this may affect website functionality)</li>
                    <li>Set preferences for different types of cookies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cookie Consent</h3>
                  <p className="text-muted-foreground">
                    When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time by clicking the cookie settings link in our footer.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Opt-Out Links</h3>
                  <p className="text-muted-foreground mb-2">
                    For third-party cookies, you can often opt out directly through their services:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
                    <li><a href="https://www.facebook.com/settings?tab=ads" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Facebook Ad Preferences</a></li>
                    <li><a href="https://twitter.com/settings/account/personalization" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Twitter Personalization</a></li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Impact of Disabling Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Impact of Disabling Cookies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  While you can disable cookies, please note that this may affect your experience on our platform:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Essential Cookies:</strong> Disabling these will prevent you from logging in or using core features</li>
                  <li><strong>Functional Cookies:</strong> You may need to re-enter preferences each time you visit</li>
                  <li><strong>Analytics Cookies:</strong> We won't be able to improve the platform based on usage data</li>
                  <li><strong>Marketing Cookies:</strong> You may see less relevant advertisements</li>
                </ul>
              </CardContent>
            </Card>

            {/* Updates to Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Updates to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> privacy@towaba.com</p>
                  <p><strong>Address:</strong> Accra, Ghana</p>
                  <p><strong>Phone:</strong> +233 24 123 4567</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

