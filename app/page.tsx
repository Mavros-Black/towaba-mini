"use client"

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, Award, Star, Shield, Zap, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh]">
        {/* Nature Background */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/beautiful-house-with-nature-elements.jpg"
            alt="Beautiful house with nature elements"
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 1
            }}
            onError={(e) => {
              console.error('Image failed to load:', (e.target as HTMLImageElement).src);
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
            }}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" style={{zIndex: 2}}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-slate-900/60" style={{zIndex: 2}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-md border border-white/30 dark:border-slate-600/30 text-white dark:text-slate-200 text-sm font-medium mb-8 shadow-2xl"
            >
              <Star className="w-4 h-4 mr-2 fill-current text-amber-500" />
              Trusted by thousands of users worldwide
            </motion.div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-100 to-white dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                Vote for Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-400 bg-clip-text text-transparent drop-shadow-2xl">
                Favorites
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl text-white/90 dark:text-slate-200 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg"
            >
              Participate in exciting events and campaigns. Every vote counts and supports your chosen nominees with our <span className="text-amber-300 dark:text-amber-400 font-semibold">secure, transparent</span> voting platform.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/campaigns">
                <Button 
                  size="lg" 
                  className="text-lg px-12 py-6 bg-gradient-to-r from-slate-800/90 to-slate-900/90 hover:from-slate-700/90 hover:to-slate-800/90 text-amber-300 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:scale-105 border border-amber-400/30 rounded-2xl font-semibold backdrop-blur-md"
                >
                  <Award className="w-5 h-5 mr-2" />
                  Browse Campaigns
                </Button>
              </Link>
              <Link href="/how-to">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-12 py-6 border-2 border-white/50 dark:border-slate-300/50 text-white dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700/20 backdrop-blur-md transition-all duration-300 transform hover:scale-105 rounded-2xl font-semibold"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Learn How
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-blue-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                Why Choose Our Platform?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Experience the future of voting with our secure, transparent, and user-friendly platform designed for modern events.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure Voting',
                description: 'Advanced encryption and blockchain technology ensure every vote is secure and tamper-proof.',
                color: 'from-blue-600 to-slate-700',
                bgColor: 'from-blue-500/20 to-slate-500/20',
                borderColor: 'border-blue-500/30',
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Connect with like-minded individuals and support your favorites in a vibrant community.',
                color: 'from-slate-600 to-slate-800',
                bgColor: 'from-slate-500/20 to-slate-600/20',
                borderColor: 'border-slate-500/30',
              },
              {
                icon: Calendar,
                title: 'Event Management',
                description: 'Comprehensive tools for organizers to create, manage, and track successful campaigns.',
                color: 'from-amber-600 to-yellow-700',
                bgColor: 'from-amber-500/20 to-yellow-500/20',
                borderColor: 'border-amber-500/30',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Real-time updates and instant results with our high-performance infrastructure.',
                color: 'from-blue-700 to-slate-800',
                bgColor: 'from-blue-500/20 to-slate-500/20',
                borderColor: 'border-blue-500/30',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -15, scale: 1.02 }}
                className="group"
              >
                <Card className={`h-full text-center hover:shadow-2xl transition-all duration-500 border ${feature.borderColor} bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-xl group-hover:bg-slate-200/40 dark:group-hover:bg-slate-700/40 rounded-3xl overflow-hidden`}>
                  <CardHeader className="pb-6 pt-8">
                    <motion.div 
                      className={`mx-auto w-20 h-20 bg-gradient-to-r ${feature.bgColor} backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-300/30 dark:border-slate-600/30`}
                      whileHover={{ rotate: 10 }}
                    >
                      <feature.icon className={`w-10 h-10 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                    </motion.div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 via-blue-600/20 to-slate-700/20 backdrop-blur-sm"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Active Users', color: 'from-blue-600 to-slate-700' },
              { number: '500+', label: 'Campaigns', color: 'from-slate-600 to-slate-800' },
              { number: '1M+', label: 'Votes Cast', color: 'from-amber-600 to-yellow-700' },
              { number: '99.9%', label: 'Uptime', color: 'from-blue-700 to-slate-800' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <div className="bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-300/30 dark:border-slate-600/30 rounded-3xl p-8 hover:bg-slate-200/40 dark:hover:bg-slate-700/40 transition-all duration-300">
                  <div className={`text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.number}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-lg font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-blue-600/20 dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl sm:text-6xl font-black mb-8">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                Ready to Start Voting?
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
              Join thousands of users who are already participating in exciting campaigns and events. 
              Your voice matters, and every vote counts!
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link href="/campaigns">
                <Button 
                  size="lg" 
                  className="text-lg px-16 py-8 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-amber-400 shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-105 border border-amber-400/20 rounded-3xl font-bold"
                >
                  <Award className="w-6 h-6 mr-3" />
                  Get Started Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-16 py-8 border-2 border-slate-400 dark:border-slate-500 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/20 backdrop-blur-md transition-all duration-300 transform hover:scale-105 rounded-3xl font-bold"
                >
                  <Heart className="w-6 h-6 mr-3" />
                  Contact Us
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
