"use client"

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Users, Shield, CreditCard, Award } from 'lucide-react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const faqCategories = [
    {
      icon: Users,
      title: 'Getting Started',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is simple! Click on "Sign Up" in the top navigation, fill in your details, and verify your email address. You\'ll be ready to start voting in minutes.'
        },
        {
          question: 'Is it free to use the platform?',
          answer: 'Yes! Creating an account and browsing campaigns is completely free. You only pay when you choose to vote in campaigns that require payment.'
        },
        {
          question: 'How do I find campaigns to vote in?',
          answer: 'Visit our "Browse Campaigns" page to see all active campaigns. You can filter by category, location, or search for specific campaigns.'
        },
        {
          question: 'Can I vote in multiple campaigns?',
          answer: 'Absolutely! You can participate in as many campaigns as you like. Each campaign is independent, so your votes in one campaign don\'t affect others.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      questions: [
        {
          question: 'How secure is my voting data?',
          answer: 'We use advanced encryption and security measures to protect your data. All votes are encrypted and stored securely. We never share your personal information with third parties.'
        },
        {
          question: 'Can I vote anonymously?',
          answer: 'Yes! Many campaigns allow anonymous voting. When you vote anonymously, your identity is protected while your vote still counts.'
        },
        {
          question: 'How do I know my vote was counted?',
          answer: 'After voting, you\'ll receive a confirmation message. You can also check the real-time vote counts on campaign pages to see your vote reflected.'
        },
        {
          question: 'What happens if there\'s a technical issue?',
          answer: 'If you experience any technical issues, contact our support team immediately. We have backup systems and can verify your vote if needed.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'Payments & Billing',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers. All payments are processed securely through our payment partners.'
        },
        {
          question: 'Why do some campaigns require payment?',
          answer: 'Some campaigns require payment to ensure serious participation and to support the campaign organizers. The payment amount is set by the campaign creator.'
        },
        {
          question: 'Can I get a refund?',
          answer: 'Refunds are handled on a case-by-case basis. If you experience technical issues or have concerns, contact our support team and we\'ll work with you to resolve the issue.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No hidden fees! The amount you see is exactly what you pay. We\'re transparent about all costs upfront.'
        }
      ]
    },
    {
      icon: Award,
      title: 'Campaigns & Voting',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      questions: [
        {
          question: 'How do I create a campaign?',
          answer: 'To create a campaign, you need to register as an organizer. Once registered, you can create campaigns, set up nominees, and manage all aspects of your voting event.'
        },
        {
          question: 'Can I edit my campaign after it\'s created?',
          answer: 'Yes, you can edit most campaign details before voting begins. However, once voting starts, some changes may be restricted to maintain fairness.'
        },
        {
          question: 'How are winners determined?',
          answer: 'Winners are determined by the total number of votes received. The nominee with the most votes wins. In case of a tie, the campaign organizer decides the winner.'
        },
        {
          question: 'Can I see who voted for whom?',
          answer: 'This depends on the campaign settings. Some campaigns show voter names, others keep votes anonymous. The campaign organizer sets these privacy preferences.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our voting platform. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
              >
                <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-6">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r ${category.bgColor} rounded-xl flex items-center justify-center mr-4`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                      >
                        <category.icon className={`w-6 h-6 text-blue-600 dark:text-blue-400`} />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-200">{category.title}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex
                        const isOpen = openItems.includes(globalIndex)
                        
                        return (
                          <motion.div
                            key={faqIndex}
                            className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: faqIndex * 0.1 }}
                          >
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full px-6 py-4 text-left bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center justify-between"
                            >
                              <span className="font-medium text-gray-800 dark:text-slate-200">{faq.question}</span>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                              </motion.div>
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-600">
                                    <p className="text-gray-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl">
              <CardContent className="p-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-xl mb-8 text-amber-100">
                  Can't find the answer you're looking for? Our support team is here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors duration-200"
                  >
                    Contact Support
                  </a>
                  <a
                    href="mailto:hello@towaba.com"
                    className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-amber-600 transition-colors duration-200"
                  >
                    Email Us
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
