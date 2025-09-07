'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner, DotsSpinner, WaveSpinner, LoadingBarSpinner } from '@/components/ui/spinner'

export default function SpinnerDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const demos = [
    {
      id: 'default',
      name: 'Default Spinner',
      component: <Spinner size="lg" text="Loading..." />,
      description: 'Multi-colored rotating rings with pulsing center'
    },
    {
      id: 'dots',
      name: 'Dots Spinner',
      component: <DotsSpinner size="lg" text="Loading..." />,
      description: 'Bouncing colored dots with staggered animation'
    },
    {
      id: 'wave',
      name: 'Wave Spinner',
      component: <WaveSpinner size="lg" text="Loading..." />,
      description: 'Animated wave bars with gradient colors'
    },
    {
      id: 'bar',
      name: 'Loading Bar',
      component: <LoadingBarSpinner text="Loading..." />,
      description: 'Smooth loading bar with gradient animation'
    }
  ]

  const sizes = [
    { id: 'sm', name: 'Small', size: 'sm' as const },
    { id: 'md', name: 'Medium', size: 'md' as const },
    { id: 'lg', name: 'Large', size: 'lg' as const },
    { id: 'xl', name: 'Extra Large', size: 'xl' as const }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Spinner Components</h1>
          <p className="text-xl text-muted-foreground">
            Beautiful, modern loading spinners for your application
          </p>
        </div>

        {/* Main Spinner Demos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {demos.map((demo) => (
            <Card key={demo.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {demo.name}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDemo(activeDemo === demo.id ? null : demo.id)}
                  >
                    {activeDemo === demo.id ? 'Hide' : 'Show'} Demo
                  </Button>
                </CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {activeDemo === demo.id && (
                  <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg">
                    {demo.component}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Size Variations */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Size Variations</CardTitle>
            <CardDescription>
              All spinners support different sizes: sm, md, lg, xl
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {sizes.map((size) => (
                <div key={size.id} className="text-center">
                  <div className="flex items-center justify-center py-8 bg-muted/30 rounded-lg mb-4">
                    <Spinner size={size.size} />
                  </div>
                  <p className="text-sm font-medium">{size.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              How to use these spinners in your components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Basic Usage:</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import { Spinner } from '@/components/ui/spinner'

// Basic spinner
<Spinner />

// With size and text
<Spinner size="lg" text="Loading..." />

// Different types
<DotsSpinner size="md" text="Processing..." />
<WaveSpinner size="lg" text="Uploading..." />
<LoadingBarSpinner text="Downloading..." />`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">In Buttons:</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner size="sm" />
      <span className="ml-2">Loading...</span>
    </>
  ) : (
    'Submit'
  )}
</Button>`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
