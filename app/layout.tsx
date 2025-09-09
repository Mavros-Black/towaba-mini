import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from 'sonner'
import { Chatbot } from '@/components/chatbot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Towaba - Event Voting Platform',
  description: 'A modern platform for managing and voting in events and campaigns',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Force hide scrollbars on ALL devices */
            html, body {
              -ms-overflow-style: none !important;
              scrollbar-width: none !important;
              overflow-x: hidden !important;
            }
            
            html::-webkit-scrollbar, 
            body::-webkit-scrollbar,
            *::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              background: transparent !important;
            }
            
            /* Mobile-specific aggressive hiding */
            @media (max-width: 768px) {
              html, body, * {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
                overflow-x: hidden !important;
              }
              
              html::-webkit-scrollbar, 
              body::-webkit-scrollbar,
              *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                background: transparent !important;
              }
              
              /* Force webkit browsers to hide scrollbars */
              * {
                -webkit-overflow-scrolling: touch !important;
              }
            }
            
            /* Additional webkit-specific rules */
            @media screen and (-webkit-min-device-pixel-ratio: 0) {
              html, body, * {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
              
              html::-webkit-scrollbar, 
              body::-webkit-scrollbar,
              *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            }
          `
        }} />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Force hide scrollbars on mobile devices
            if (window.innerWidth <= 768) {
              document.documentElement.style.setProperty('-ms-overflow-style', 'none', 'important');
              document.documentElement.style.setProperty('scrollbar-width', 'none', 'important');
              document.body.style.setProperty('-ms-overflow-style', 'none', 'important');
              document.body.style.setProperty('scrollbar-width', 'none', 'important');
              
              // Add CSS to hide webkit scrollbars
              const style = document.createElement('style');
              style.textContent = \`
                html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
              \`;
              document.head.appendChild(style);
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <Chatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
