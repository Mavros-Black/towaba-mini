"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { name: 'How It Works', href: '/how-to' },
      { name: 'Browse Campaigns', href: '/campaigns' },
      { name: 'Create Campaign', href: '/organizer/register' },
      { name: 'Pricing', href: '/pricing' },
    ],
    support: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Security', href: '/security' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ]

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-400/10 via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-black mb-6 bg-gradient-to-r from-slate-200 via-slate-100 to-amber-400 bg-clip-text text-transparent">
                Towaba
              </h3>
              <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                The most trusted voting platform for events, campaigns, and community decisions. 
                Secure, transparent, and designed for the modern world.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-600/30 to-slate-700/30 rounded-xl flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-slate-300" />
                  </div>
                  <span>hello@towaba.com</span>
                </div>
                <div className="flex items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600/30 to-slate-700/30 rounded-xl flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-blue-300" />
                  </div>
                  <span>+233 24 123 4567</span>
                </div>
                <div className="flex items-center text-slate-300 hover:text-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Platform Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-slate-300 to-amber-400 bg-clip-text text-transparent">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-amber-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-300 to-slate-300 bg-clip-text text-transparent">Support</h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-amber-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-amber-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-slate-600"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-amber-400 transition-colors duration-200"
                >
                  <social.icon className="w-6 h-6" />
                </Link>
              ))}
            </div>
            
            <div className="text-slate-400 text-sm">
              © {currentYear} Towaba. All rights reserved. Built with{' '}
              <Heart className="w-4 h-4 inline text-amber-400" /> for the community.
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
