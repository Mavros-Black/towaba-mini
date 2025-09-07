import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
}

export function Spinner({ size = "md", className, text }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin",
          sizeClasses[size]
        )} style={{ animationDuration: '1s' }}>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}>
            <div className="absolute inset-0 border-4 border-transparent border-r-amber-500 dark:border-r-amber-400 rounded-full animate-spin" style={{ animationDuration: '1.2s' }}>
              <div className="absolute inset-0 border-4 border-transparent border-b-purple-600 dark:border-b-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}>
                <div className="absolute inset-0 border-4 border-transparent border-l-green-500 dark:border-l-green-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// Alternative modern spinner with dots
export function DotsSpinner({ size = "md", className, text }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3", 
    xl: "w-4 h-4"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="flex space-x-1">
        <div className={cn(
          "bg-blue-500 rounded-full animate-bounce",
          sizeClasses[size]
        )} style={{ animationDelay: '0ms' }}></div>
        <div className={cn(
          "bg-amber-500 rounded-full animate-bounce", 
          sizeClasses[size]
        )} style={{ animationDelay: '150ms' }}></div>
        <div className={cn(
          "bg-purple-500 rounded-full animate-bounce",
          sizeClasses[size]
        )} style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  )
}

// Elegant wave spinner
export function WaveSpinner({ size = "md", className, text }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-1 h-4",
    md: "w-1.5 h-6",
    lg: "w-2 h-8",
    xl: "w-3 h-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      <div className="flex items-end space-x-1">
        <div className={cn(
          "bg-gradient-to-t from-blue-500 to-blue-300 rounded-full animate-pulse",
          sizeClasses[size]
        )} style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
        <div className={cn(
          "bg-gradient-to-t from-amber-500 to-amber-300 rounded-full animate-pulse",
          sizeClasses[size]
        )} style={{ animationDelay: '200ms', animationDuration: '1s' }}></div>
        <div className={cn(
          "bg-gradient-to-t from-purple-500 to-purple-300 rounded-full animate-pulse",
          sizeClasses[size]
        )} style={{ animationDelay: '400ms', animationDuration: '1s' }}></div>
        <div className={cn(
          "bg-gradient-to-t from-green-500 to-green-300 rounded-full animate-pulse",
          sizeClasses[size]
        )} style={{ animationDelay: '600ms', animationDuration: '1s' }}></div>
        <div className={cn(
          "bg-gradient-to-t from-pink-500 to-pink-300 rounded-full animate-pulse",
          sizeClasses[size]
        )} style={{ animationDelay: '800ms', animationDuration: '1s' }}></div>
      </div>
      
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  )
}

// Loading bar spinner
export function LoadingBarSpinner({ className, text }: Omit<SpinnerProps, 'size'>) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3 w-full", className)}>
      <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 rounded-full animate-pulse" style={{ 
          animation: 'loading-bar 2s ease-in-out infinite',
          width: '100%'
        }}></div>
      </div>
      
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  )
}

// Add custom keyframes to your global CSS
export const spinnerStyles = `
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
`
