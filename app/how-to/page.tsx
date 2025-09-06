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
      icon: Search,
      title: 'Find Campaigns',
      description: 'Browse available voting campaigns and discover exciting events.',
      details: [
        'Visit the "Browse Campaigns" page',
        'Search for campaigns by name or category',
        'Read campaign descriptions and rules',
        'Check voting requirements and deadlines'
      ],
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    },
    {
      icon: Users,
      title: 'Explore Categories',
      description: 'Find categories within campaigns and see available nominees.',
      details: [
        'Select a campaign to view its categories',
        'Browse different voting categories',
        'View nominee profiles and information',
        'Read nominee bios and descriptions'
      ],
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    },
    {
      icon: Vote,
      title: 'Cast Your Vote',
      description: 'Support your favorite nominees with secure, transparent voting.',
      details: [
        'Select your preferred nominee',
        'Choose your voting amount (if required)',
        'Complete payment securely (if applicable)',
        'Confirm your vote and see it counted'
      ],
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
    },
    {
      icon: Trophy,
      title: 'Track Results',
      description: 'Watch real-time results and celebrate with the winners.',
      details: [
        'View live vote counts and rankings',
        'Follow campaign progress in real-time',
        'See final results when campaigns end',
        'Celebrate the winners and nominees'
      ],
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-violet-900/20 dark:to-slate-800 relative overflow-hidden">
        {/* Background Design */}
        <div className="absolute inset-0 opacity-35">
          {/* Diamond and Star Shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-violet-500 rotate-45 blur-2xl"></div>
          <div className="absolute top-32 right-32 w-28 h-28 bg-purple-500 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-pink-500 rotate-45 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-fuchsia-500 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-12 w-20 h-20 bg-violet-400 rotate-45 blur-xl"></div>
          <div className="absolute top-1/3 right-12 w-16 h-16 bg-purple-400 rounded-full blur-lg"></div>
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-pink-400 rotate-45 blur-xl"></div>
          <div className="absolute top-2/3 right-1/4 w-18 h-18 bg-fuchsia-400 rounded-full blur-lg"></div>
          <div className="absolute top-1/4 left-1/3 w-22 h-22 bg-violet-300 rotate-45 blur-lg"></div>
          <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-purple-300 rounded-full blur-lg"></div>
          <div className="absolute top-3/4 left-1/5 w-26 h-26 bg-pink-300 rotate-45 blur-xl"></div>
          <div className="absolute bottom-1/5 right-1/5 w-14 h-14 bg-fuchsia-300 rounded-full blur-lg"></div>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
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
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
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
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              No registration required! Simply find campaigns, explore categories, and vote for your favorites.
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
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-slate-800">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className={`mx-auto w-16 h-16 bg-gradient-to-r ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <step.icon className={`w-8 h-8 text-blue-600 dark:text-blue-400`} />
                    </motion.div>
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-2">STEP {index + 1}</div>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-300">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-sm text-gray-600 dark:text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50/30 dark:from-slate-800 dark:to-slate-700/30">
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
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
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
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-slate-800">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className={`mx-auto w-16 h-16 bg-gradient-to-r ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <step.icon className={`w-8 h-8 text-purple-600 dark:text-purple-400`} />
                    </motion.div>
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">STEP {index + 1}</div>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-300">
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
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
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
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:bg-white dark:group-hover:bg-slate-800">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className="mx-auto w-16 h-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 5 }}
                    >
                      <feature.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-slate-100 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-300">
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
