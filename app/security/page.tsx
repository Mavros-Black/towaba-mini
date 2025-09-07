"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Eye, Database, AlertTriangle, CheckCircle, Key, Server } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 py-16">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-primary mr-4" />
              <h1 className="text-4xl font-bold">Security</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Your security is our top priority. Learn about the measures we take to protect your data and ensure safe voting.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Security Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-primary" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  At Towaba, we implement multiple layers of security to protect your data, ensure fair voting, and maintain the integrity of our platform. Our security measures are designed to meet industry standards and protect against various threats.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Regular security audits</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Multi-factor authentication</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Fraud detection systems</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-6 h-6 mr-3 text-primary" />
                  Data Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Encryption</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Data in Transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3</li>
                    <li><strong>Data at Rest:</strong> Sensitive data is encrypted using AES-256 encryption</li>
                    <li><strong>Database Security:</strong> All databases are encrypted and access is strictly controlled</li>
                    <li><strong>Backup Encryption:</strong> Regular backups are encrypted and stored securely</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Access Controls</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Role-based access control for all system components</li>
                    <li>Multi-factor authentication for administrative access</li>
                    <li>Regular access reviews and permission audits</li>
                    <li>Principle of least privilege for all user accounts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-6 h-6 mr-3 text-primary" />
                  Authentication Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Password Security</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Strong password requirements (minimum 8 characters, mixed case, numbers, symbols)</li>
                    <li>Password hashing using bcrypt with salt</li>
                    <li>Account lockout after multiple failed login attempts</li>
                    <li>Password reset functionality with secure token generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Session Management</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Secure session tokens with expiration</li>
                    <li>Automatic logout after periods of inactivity</li>
                    <li>Session invalidation on password changes</li>
                    <li>Protection against session hijacking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Voting Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-primary" />
                  Voting Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Vote Integrity</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Cryptographic vote verification and audit trails</li>
                    <li>Prevention of duplicate voting through user authentication</li>
                    <li>Timestamp verification for all votes</li>
                    <li>Immutable vote records that cannot be altered</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fraud Prevention</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Rate limiting to prevent automated voting</li>
                    <li>IP address monitoring and analysis</li>
                    <li>Behavioral analysis to detect suspicious patterns</li>
                    <li>Real-time fraud detection algorithms</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Campaign Security</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Secure campaign creation and management</li>
                    <li>Access controls for campaign organizers</li>
                    <li>Audit logs for all campaign activities</li>
                    <li>Protection against unauthorized campaign modifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-6 h-6 mr-3 text-primary" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Server Security</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Regular security updates and patches</li>
                    <li>Intrusion detection and prevention systems</li>
                    <li>Network segmentation and firewall protection</li>
                    <li>DDoS protection and mitigation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Monitoring and Logging</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>24/7 security monitoring and alerting</li>
                    <li>Comprehensive audit logging of all activities</li>
                    <li>Real-time threat detection and response</li>
                    <li>Regular security assessments and penetration testing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Backup and Recovery</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Automated daily backups with encryption</li>
                    <li>Geographically distributed backup storage</li>
                    <li>Regular disaster recovery testing</li>
                    <li>Business continuity planning</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-primary" />
                  Payment Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We use industry-leading payment processors to ensure your financial information is secure:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>PCI DSS Compliance:</strong> Our payment processors are PCI DSS Level 1 certified</li>
                  <li><strong>Tokenization:</strong> Sensitive payment data is tokenized and never stored on our servers</li>
                  <li><strong>Fraud Detection:</strong> Advanced fraud detection algorithms monitor all transactions</li>
                  <li><strong>Secure Processing:</strong> All payments are processed through encrypted connections</li>
                  <li><strong>3D Secure:</strong> Additional authentication for high-risk transactions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-primary" />
                  Privacy Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We protect your privacy through various technical and organizational measures:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Data Minimization:</strong> We only collect data necessary for our services</li>
                  <li><strong>Anonymization:</strong> Personal data is anonymized where possible</li>
                  <li><strong>Access Logging:</strong> All access to personal data is logged and monitored</li>
                  <li><strong>Data Retention:</strong> Clear policies for data retention and deletion</li>
                  <li><strong>User Control:</strong> You can access, modify, or delete your data at any time</li>
                </ul>
              </CardContent>
            </Card>

            {/* Incident Response */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-primary" />
                  Incident Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  In the event of a security incident, we have established procedures to respond quickly and effectively:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Detection:</strong> Automated monitoring systems detect potential security incidents</li>
                  <li><strong>Response:</strong> Dedicated security team responds within defined timeframes</li>
                  <li><strong>Containment:</strong> Immediate steps to contain and mitigate the incident</li>
                  <li><strong>Investigation:</strong> Thorough investigation to understand the scope and impact</li>
                  <li><strong>Notification:</strong> Affected users are notified as required by law</li>
                  <li><strong>Recovery:</strong> Steps to restore normal operations and prevent recurrence</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Your Security Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  While we implement strong security measures, you also play a role in keeping your account secure:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Use strong, unique passwords for your account</li>
                  <li>Keep your login credentials confidential</li>
                  <li>Log out from shared or public computers</li>
                  <li>Report any suspicious activity immediately</li>
                  <li>Keep your device software and browsers updated</li>
                  <li>Be cautious of phishing attempts and suspicious emails</li>
                </ul>
              </CardContent>
            </Card>

            {/* Reporting Security Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Reporting Security Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you discover a security vulnerability or have concerns about our security practices, please report them to us immediately:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> security@towaba.com</p>
                  <p><strong>Response Time:</strong> We aim to respond to security reports within 24 hours</p>
                  <p><strong>Confidentiality:</strong> We treat all security reports with strict confidentiality</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about our security practices, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> security@towaba.com</p>
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

