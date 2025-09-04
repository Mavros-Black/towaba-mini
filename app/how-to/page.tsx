"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  UserPlus, 
  Search, 
  Vote, 
  Trophy, 
  Users, 
  Settings, 
  BarChart3, 
  Award,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export default function HowToPage() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up for free and verify your email address to get started.',
      details: [
        'Click "Sign Up" in the top navigation',
        'Fill in your personal details',
        'Verify your email address',
        'Complete your profile setup'
      ],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
    },
    {
      icon: Search,
      title: 'Browse Campaigns',
      description: 'Discover exciting voting campaigns and events happening now.',
      details: [
        'Visit the "Browse Campaigns" page',
        'Filter by category or location',
        'Read campaign descriptions',
        'Check voting requirements'
      ],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
    },
    {
      icon: Vote,
      title: 'Cast Your Vote',
      description: 'Support your favorite nominees with secure, transparent voting.',
      details: [
        'Select your preferred nominee',
        'Choose your voting amount (if required)',
        'Complete payment (if applicable)',
        'Confirm your vote'
      ],
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
    },
    {
      icon: Trophy,
      title: 'Track Results',
      description: 'Watch real-time results and celebrate with the winners.',
      details: [
        'View live vote counts',
        'Follow campaign progress',
        'See final results',
        'Celebrate the winners'
      ],
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50',
    }
  ]

  const organizerSteps = [
    {
      icon: Users,
      title: 'Register as Organizer',
      description: 'Create an organizer account to start managing your own campaigns.',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
    },
    {
      icon: Settings,
      title: 'Create Campaign',
      description: 'Set up your voting campaign with nominees, categories, and rules.',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'from-pink-50 to-rose-50',
    },
    {
      icon: BarChart3,
      title: 'Manage & Monitor',
      description: 'Track votes, manage nominees, and monitor campaign performance.',
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'from-teal-50 to-cyan-50',
    },
    {
      icon: Award,
      title: 'Announce Winners',
      description: 'Declare winners and share results with your community.',
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'from-yellow-50 to-amber-50',
    }
  ]

  const features = [
    {
      icon: CheckCircle,
      title: 'Secure Voting',
      description: 'Advanced encryption ensures your votes are safe and tamper-proof.',
    },
    {
      icon: Star,
      title: 'Real-time Results',
      description: 'See live vote counts and results as they happen.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with like-minded people and support your favorites.',
    },
    {
      icon: Award,
      title: 'Fair & Transparent',
      description: 'Every vote counts equally in our transparent voting system.',
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Learn how to participate in voting campaigns and create your own events. 
              It's simple, secure, and designed for everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Voter Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                For Voters
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow these simple steps to start voting in campaigns and supporting your favorites.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group-hover:bg-white">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className={`mx-auto w-16 h-16 bg-gradient-to-r ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <step.icon className={`w-8 h-8 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <div className="text-sm font-bold text-amber-600 mb-2">STEP {index + 1}</div>
                    <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizer Steps */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                For Organizers
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create and manage your own voting campaigns with our comprehensive organizer tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {organizerSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group-hover:bg-white">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className={`mx-auto w-16 h-16 bg-gradient-to-r ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <step.icon className={`w-8 h-8 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <div className="text-sm font-bold text-purple-600 mb-2">STEP {index + 1}</div>
                    <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Why Choose Our Platform?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the benefits of our modern, secure, and user-friendly voting platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm group-hover:bg-white">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="mx-auto w-16 h-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent" />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-amber-100 mb-8 leading-relaxed">
              Join thousands of users who are already participating in exciting campaigns and events.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/campaigns">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 bg-white text-amber-600 hover:bg-amber-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Vote className="w-5 h-5 mr-2" />
                  Start Voting
                </Button>
              </Link>
              <Link href="/organizer/register">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 border-2 border-white text-white hover:bg-white hover:text-amber-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
