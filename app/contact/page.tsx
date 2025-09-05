"use client"

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email anytime',
      value: 'hello@towaba.com',
      color: 'from-blue-600 to-slate-700',
      bgColor: 'from-blue-50 to-slate-100 dark:from-blue-900/20 dark:to-slate-800/20',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Fri from 8am to 5pm',
      value: '+233 24 123 4567',
      color: 'from-slate-600 to-slate-800',
      bgColor: 'from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Come say hello at our office',
      value: 'Accra, Ghana',
      color: 'from-amber-600 to-yellow-700',
      bgColor: 'from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20',
    },
    {
      icon: Clock,
      title: 'Response Time',
      description: 'We typically respond within',
      value: '24 hours',
      color: 'from-blue-700 to-slate-800',
      bgColor: 'from-blue-50 to-slate-100 dark:from-blue-900/20 dark:to-slate-800/20',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-slate-500/30 to-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-600/30 to-slate-700/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-2xl">
                Get in Touch
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform? Need help with your campaign? 
              We're here to help and would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full text-center hover:shadow-2xl transition-all duration-500 border border-slate-200/30 dark:border-slate-700/30 bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-xl hover:bg-slate-200/40 dark:hover:bg-slate-700/40 rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <motion.div 
                      className={`mx-auto w-16 h-16 bg-gradient-to-r ${info.bgColor} rounded-2xl flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <info.icon className={`w-8 h-8 text-blue-600 dark:text-blue-400`} />
                    </motion.div>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {info.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {info.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{info.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border border-slate-200/30 dark:border-slate-700/30 bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-black text-slate-800 dark:text-slate-200 mb-4">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Message Sent!</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 rounded-xl"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 rounded-xl"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 rounded-xl"
                        placeholder="What's this about?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-slate-500 dark:focus:ring-slate-400 rounded-xl"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    
                    <div className="text-center">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-12 py-6 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-amber-400 shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold border border-amber-400/20"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
