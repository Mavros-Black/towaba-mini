import { NextRequest, NextResponse } from 'next/server'

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
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const response = findBestResponse(message)
    
    return NextResponse.json({
      response,
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

