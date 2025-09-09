import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'

// Knowledge base for Towaba-specific questions
const knowledgeBase = {
  // Campaign related
  "create campaign": {
    response: "To create a campaign on Towaba:\n\n1. Sign up or log in to your organizer account\n2. Go to the dashboard and click 'Create Campaign'\n3. Fill in campaign details (title, description, dates)\n4. Set voting options and payment settings\n5. Upload a cover image\n6. Publish your campaign\n\nYou can also visit /organizer/register to get started!",
    keywords: ["create", "campaign", "new", "start", "make"]
  },
  "voting": {
    response: "Voting on Towaba is simple:\n\n1. Browse public campaigns at /campaigns\n2. Click on a campaign you're interested in\n3. View the nominees and their details\n4. Click 'Vote' on your preferred nominee\n5. Complete payment if required\n6. Your vote is recorded securely\n\nAll votes are encrypted and cannot be changed once submitted.",
    keywords: ["vote", "voting", "how to vote", "participate"]
  },
  "payment": {
    response: "We accept multiple payment methods:\n\n• Credit/Debit Cards (Visa, Mastercard)\n• Mobile Money (MTN, Vodafone, AirtelTigo)\n• Bank transfers\n• Paystack integration for secure processing\n\nAll payments are processed securely through our trusted payment partners. You can view our pricing at /pricing.",
    keywords: ["payment", "pay", "money", "cost", "price", "billing"]
  },
  "pricing": {
    response: "Our pricing plans:\n\n• **Starter (Free)**: Up to 100 votes per campaign\n• **Professional (₵50/campaign)**: Up to 1,000 votes\n• **Enterprise (₵200/month)**: Unlimited votes + premium features\n\nVisit /pricing for detailed information about features and benefits of each plan.",
    keywords: ["pricing", "cost", "price", "plans", "subscription"]
  },
  "password": {
    response: "To reset your password:\n\n1. Go to the login page\n2. Click 'Forgot Password?'\n3. Enter your email address\n4. Check your email for reset instructions\n5. Follow the link to create a new password\n\nIf you're still having trouble, contact our support team at support@towaba.com",
    keywords: ["password", "reset", "forgot", "login", "account"]
  },
  "support": {
    response: "We're here to help! You can reach us through:\n\n• **Email**: support@towaba.com\n• **Phone**: +233 24 123 4567\n• **Live Chat**: Available 9 AM - 6 PM GMT\n• **Help Center**: /help for articles and guides\n\nResponse times:\n• Live Chat: Usually within 5 minutes\n• Email: Within 24 hours\n• Phone: Immediate during business hours",
    keywords: ["support", "help", "contact", "assistance", "problem"]
  },
  "security": {
    response: "Your security is our top priority:\n\n• End-to-end encryption for all data\n• Secure payment processing (PCI DSS compliant)\n• Regular security audits and monitoring\n• Multi-factor authentication available\n• Vote integrity protection\n• Fraud detection systems\n\nVisit /security to learn more about our security measures.",
    keywords: ["security", "safe", "secure", "privacy", "protection"]
  },
  "account": {
    response: "Manage your account:\n\n• **Profile**: Update your personal information\n• **Settings**: Change preferences and notifications\n• **Campaigns**: View and manage your campaigns\n• **Analytics**: Track campaign performance\n• **Payments**: View transaction history\n\nLog in to your dashboard to access all account features.",
    keywords: ["account", "profile", "settings", "dashboard", "manage"]
  },
  "features": {
    response: "Towaba offers powerful features:\n\n• **Campaign Management**: Create and manage voting campaigns\n• **Secure Voting**: Encrypted vote processing\n• **Payment Integration**: Multiple payment methods\n• **Analytics**: Detailed campaign insights\n• **Mobile Responsive**: Works on all devices\n• **Real-time Updates**: Live vote counting\n• **Campaign Protection**: Anti-fraud measures\n\nVisit /how-to to learn more about our platform.",
    keywords: ["features", "what can", "capabilities", "functionality"]
  }
}

// Additional Towaba FAQs to enrich chatbot answers
const additionalFAQs = [
  {
    key: 'organizer registration',
    response:
      'To register as an organizer: 1) Create an account or log in, 2) Go to /organizer/register, 3) Complete the organizer profile, 4) Submit for review if required, 5) Start creating campaigns.',
    keywords: ['organizer registration', 'become organizer', 'register organizer', 'start organizing']
  },
  {
    key: 'campaign approval',
    response:
      'Campaign approval: Draft your campaign, ensure required details and payment settings are set, then submit. Admin may review for policy compliance. Status changes from draft → pending → approved → published.',
    keywords: ['campaign approval', 'approve campaign', 'publish campaign', 'campaign status']
  },
  {
    key: 'campaign status',
    response:
      'Campaign statuses: draft (editing), pending (awaiting review), approved (ready), published (live), suspended (temporarily disabled), ended (finished).',
    keywords: ['campaign status', 'status meaning', 'states', 'suspended', 'ended']
  },
  {
    key: 'edit campaign',
    response:
      'Edit a campaign from your organizer dashboard → Campaigns → select campaign → Edit. You can update details, dates, cover, and payment options. Some fields lock after publishing.',
    keywords: ['edit campaign', 'update campaign', 'change campaign']
  },
  {
    key: 'duplicate campaign',
    response:
      'To duplicate a campaign: Organizer dashboard → Campaigns → actions (⋯) → Duplicate. Review settings before publishing the copy.',
    keywords: ['duplicate campaign', 'clone campaign', 'copy campaign']
  },
  {
    key: 'suspend campaign',
    response:
      'Suspend a campaign from Organizer dashboard → Campaigns → actions (⋯) → Suspend. Suspended campaigns are not visible to voters until reactivated.',
    keywords: ['suspend campaign', 'pause campaign', 'disable campaign']
  },
  {
    key: 'delete campaign',
    response:
      'Delete campaign: Organizer dashboard → Campaigns → actions (⋯) → Delete. Note: Deleting removes campaign data and may be restricted once votes/payments exist.',
    keywords: ['delete campaign', 'remove campaign']
  },
  {
    key: 'vote protection',
    response:
      'Vote protection: We use encrypted vote tokens, anti-fraud checks, and optional campaign protection features (IP/device checks, rate limits) to preserve integrity.',
    keywords: ['vote protection', 'fraud', 'security votes', 'integrity']
  },
  {
    key: 'payment methods',
    response:
      'Supported payments: Ghana Mobile Money (MTN, Vodafone, AirtelTigo), cards (Visa/Mastercard), and Paystack rails. All payments are secured and logged in your dashboard.',
    keywords: ['payment methods', 'mobile money', 'cards', 'paystack']
  },
  {
    key: 'fees and commission',
    response:
      'Fees: Towaba deducts a platform commission from organizer earnings. Exact rates may vary by plan and method. You can track commissions in Admin/Organizer financial reports.',
    keywords: ['fees', 'commission', 'platform fees', 'charges']
  },
  {
    key: 'refunds',
    response:
      'Refunds: Handled via Admin → Payments. Admin can verify, reject, or refund transactions with notes. Approved refunds are reflected in reports and organizer earnings.',
    keywords: ['refund', 'refunds', 'chargeback', 'dispute']
  },
  {
    key: 'verification of payments',
    response:
      'Payment verification occurs automatically via webhooks; admins can also manually verify or mark statuses in Admin → Payments. Only verified payments count toward votes/earnings.',
    keywords: ['verify payment', 'verification', 'payment status']
  },
  {
    key: 'payouts timeline',
    response:
      'Payouts timeline: Typically 3–5 business days after approval, depending on payout method and bank/mobile money processing times.',
    keywords: ['payout timeline', 'payout time', 'when payout']
  },
  {
    key: 'reports and analytics',
    response:
      'Reports & Analytics: Admin → Reports provides overview, revenue, campaigns, users, and payments reports (CSV export). Organizer dashboard shows campaign analytics and recent activity.',
    keywords: ['reports', 'analytics', 'export', 'csv']
  },
  {
    key: 'admin roles',
    response:
      'Admin roles: Super admins and other admin roles are stored in the admin_roles table with permissions like manage_users, manage_campaigns, etc.',
    keywords: ['admin roles', 'permissions', 'super admin']
  },
  {
    key: 'user management',
    response:
      'User management: Admin → Users lets you view users, filter by role/status, and perform actions like suspend/activate or approve organizers.',
    keywords: ['user management', 'manage users', 'suspend user', 'activate user']
  },
  {
    key: 'currencies',
    response:
      'Currency: Amounts are stored in pesewas in the database and displayed as Ghana Cedis (GHS) on the dashboard for clarity.',
    keywords: ['currency', 'cedis', 'ghs', 'pesewas']
  },
  {
    key: 'limits and quotas',
    response:
      'Limits: Plans may impose vote or feature limits (e.g., Starter vs Professional). Payment provider and rate limits may also apply during peak usage.',
    keywords: ['limits', 'quota', 'plan limits']
  },
  {
    key: 'security and privacy',
    response:
      'Security & Privacy: We use encryption, secure payment processing, and standard data protection practices. See /security and /privacy for details.',
    keywords: ['security', 'privacy', 'data protection']
  },
  {
    key: 'support hours',
    response:
      'Support hours: Live chat 9 AM–6 PM GMT, email replies within 24 hours. Contact support@towaba.com for help.',
    keywords: ['support hours', 'contact support', 'help time']
  }
]

// Merge additional FAQs into the knowledge base
for (const faq of additionalFAQs) {
  ;(knowledgeBase as any)[faq.key] = { response: faq.response, keywords: faq.keywords }
}

// Add payouts knowledge for organizers
;(knowledgeBase as any)["payouts"] = {
  response:
    "Organizer payouts on Towaba:\n\n1) Earnings: You earn from verified voter payments on your campaigns.\n2) Commission: Platform fees/commission are deducted automatically.\n3) Request/Process: Admin reviews and processes payout requests in the Admin → Payouts page.\n4) Status: You can track payout status (pending, processing, completed) in your organizer dashboard.\n5) Timeline: Payouts are typically processed within 3–5 business days, depending on method.",
  keywords: ["payout", "payouts", "withdraw", "cashout", "earnings", "commission"]
}

// General responses for common queries
const generalResponses = {
  greeting: [
    "Hello! I'm here to help you with Towaba. How can I assist you today?",
    "Hi there! I'm your Towaba assistant. What would you like to know?",
    "Welcome! I can help you with questions about our voting platform. What do you need help with?"
  ],
  thanks: [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Feel free to ask if you have more questions.",
    "Glad I could assist! Let me know if you need anything else."
  ],
  default: [
    "I understand you're asking about that. Let me help you find the right information. Could you be more specific about what you'd like to know?",
    "That's a great question! I'd be happy to help. Can you provide more details about what you're looking for?",
    "I want to make sure I give you the best answer. Could you rephrase your question or provide more context?"
  ]
}

// Simple on-topic detection for Towaba/platform scope
const onTopicKeywords = [
  'towaba', 'campaign', 'campaigns', 'nominee', 'nominees', 'vote', 'voting', 'organizer', 'organizers',
  'payment', 'payments', 'payout', 'payouts', 'reports', 'report', 'dashboard', 'admin', 'users', 'analytics',
  'pricing', 'plans', 'register', 'login', 'account', 'security', 'commission', 'platform fees'
]

function isOnTopic(message: string): boolean {
  const m = message.toLowerCase()
  return onTopicKeywords.some(k => m.includes(k))
}

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check for greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return generalResponses.greeting[Math.floor(Math.random() * generalResponses.greeting.length)]
  }
  
  // Check for thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return generalResponses.thanks[Math.floor(Math.random() * generalResponses.thanks.length)]
  }
  
  // Check knowledge base
  for (const [key, data] of Object.entries(knowledgeBase)) {
    const keywords = data.keywords
    const hasKeyword = keywords.some(keyword => lowerMessage.includes(keyword))
    
    if (hasKeyword) {
      return data.response
    }
  }
  
  // Check for specific patterns
  if (lowerMessage.includes('how to') && lowerMessage.includes('campaign')) {
    return knowledgeBase["create campaign"].response
  }
  
  if (lowerMessage.includes('how to') && lowerMessage.includes('vote')) {
    return knowledgeBase["voting"].response
  }
  
  if (lowerMessage.includes('payout')) {
    return (knowledgeBase as any)["payouts"].response
  }

  if (lowerMessage.includes('how much') || lowerMessage.includes('cost')) {
    return knowledgeBase["pricing"].response
  }
  
  if (lowerMessage.includes('contact') || lowerMessage.includes('help')) {
    return knowledgeBase["support"].response
  }
  
  // Default response
  return generalResponses.default[Math.floor(Math.random() * generalResponses.default.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    // Hard guard: only answer Towaba/platform-related queries
    if (!isOnTopic(message)) {
      return NextResponse.json({
        response: "I can help with Towaba's platform only (campaigns, voting, payments, organizers, admin, reports). Please ask a Towaba-related question.",
        provider: 'guard',
        timestamp: new Date().toISOString()
      })
    }

    const apiKey = process.env.OPENAI_API_KEY
    
    if (apiKey) {
      try {
        const systemPrompt = `You are Towaba's helpful assistant. Only answer questions related to the Towaba platform.\nIf a question is not about Towaba (campaigns, voting, payments, payouts, organizers, admin dashboard, reports, pricing, security, accounts), politely refuse with one line saying you can only help with Towaba.\nBe concise, friendly, and accurate. Use Ghana Cedis (GHS).`
        const kbSummary = Object.entries(knowledgeBase)
          .map(([k, v]: any) => `Topic: ${k}\nAnswer: ${v.response}`)
          .join('\n---\n')

        // Simple retry with exponential backoff for 429s
        let data: any | null = null
        const maxAttempts = 3
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 15000)
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              temperature: 0.4,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Knowledge base (reference):\n${kbSummary}\n\nUser message: ${message}` }
              ]
            }),
            signal: controller.signal
          })
          clearTimeout(timeout)

          if (res.ok) {
            data = await res.json()
            break
          }

          // On 429, backoff and retry; otherwise break
          if (res.status === 429 && attempt < maxAttempts) {
            const backoffMs = 400 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200)
            await new Promise(r => setTimeout(r, backoffMs))
            continue
          } else {
            throw new Error(`OpenAI error: ${res.status}`)
          }
        }

        const aiText = data?.choices?.[0]?.message?.content?.trim()
        const finalText = aiText || findBestResponse(message)

        return NextResponse.json({
          response: finalText,
          provider: 'openai',
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        console.error('OpenAI request failed, falling back:', err)
        const response = findBestResponse(message)
        return NextResponse.json({
          response,
          provider: 'fallback',
          timestamp: new Date().toISOString()
        })
      }
    }

    // Fallback to rules-based response when no API key is set
    const response = findBestResponse(message)
    return NextResponse.json({
      response,
      provider: 'rules',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Towaba Chatbot API is running',
    version: '1.0.0',
    features: [
      'Campaign management assistance',
      'Payment and pricing information',
      'Account and security help',
      'General platform support'
    ]
  })
}

