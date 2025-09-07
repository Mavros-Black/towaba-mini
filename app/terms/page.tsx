"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Scale, AlertTriangle, Users, CreditCard, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 py-16">
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Please read these terms carefully before using our voting platform.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Acceptance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="w-6 h-6 mr-3 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using Towaba's voting platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Towaba provides a digital platform for creating, managing, and participating in voting campaigns and events. Our services include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Campaign creation and management tools</li>
                  <li>Secure voting mechanisms</li>
                  <li>Payment processing for paid votes</li>
                  <li>Analytics and reporting features</li>
                  <li>User account management</li>
                  <li>Customer support services</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary" />
                  User Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Creation</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You must provide accurate and complete information when creating an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must be at least 18 years old to create an account</li>
                    <li>One person or entity may not maintain multiple accounts</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-primary" />
                  Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Permitted Uses</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Creating legitimate voting campaigns for events, competitions, or decisions</li>
                    <li>Participating in campaigns as a voter</li>
                    <li>Using the platform in accordance with applicable laws and regulations</li>
                    <li>Providing feedback and suggestions for platform improvement</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Creating fraudulent or misleading campaigns</li>
                    <li>Attempting to manipulate voting results through automated means</li>
                    <li>Harassing, threatening, or abusing other users</li>
                    <li>Violating any applicable laws or regulations</li>
                    <li>Attempting to gain unauthorized access to our systems</li>
                    <li>Using the platform for illegal or harmful purposes</li>
                    <li>Creating multiple accounts to circumvent restrictions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-primary" />
                  Payments and Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All payments are processed securely through third-party payment providers</li>
                    <li>Prices are displayed in Ghana Cedis (GHS) and are subject to applicable taxes</li>
                    <li>Payment is required before votes are processed</li>
                    <li>We reserve the right to change pricing with 30 days notice</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Refunds are generally not provided for completed votes</li>
                    <li>Refunds may be considered in cases of technical errors or platform failures</li>
                    <li>Refund requests must be submitted within 7 days of the transaction</li>
                    <li>All refund decisions are at our sole discretion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  The Towaba platform, including its design, functionality, and content, is protected by intellectual property laws. You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Copy, modify, or distribute our platform or its components</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Use our trademarks or branding without permission</li>
                  <li>Create derivative works based on our platform</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary" />
                  Privacy and Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Our collection and use of personal information is governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which is incorporated into these terms by reference.
                </p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To the maximum extent permitted by law, Towaba shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or technical failures</li>
                  <li>Third-party actions or content</li>
                  <li>Damages resulting from your use of the platform</li>
                </ul>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account and access to our services at any time, with or without notice, for any reason, including if you breach these terms.
                </p>
                <p className="text-muted-foreground">
                  You may terminate your account at any time by contacting us. Upon termination, your right to use the service will cease immediately.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@towaba.com</p>
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

