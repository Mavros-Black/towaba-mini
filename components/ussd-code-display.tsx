import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Smartphone } from 'lucide-react'
import { formatUSSDCode } from '@/lib/ussd-codes'

interface USSDCodeDisplayProps {
  ussdCode: string
  nomineeName: string
  campaignTitle: string
  amount: number
}

export function USSDCodeDisplay({ 
  ussdCode, 
  nomineeName, 
  campaignTitle, 
  amount 
}: USSDCodeDisplayProps) {
  const formattedCode = formatUSSDCode(ussdCode)
  const amountInCedis = (amount / 100).toFixed(2)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedCode)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-slate-200">
            USSD Code
          </CardTitle>
          <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* USSD Code Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {ussdCode}
          </div>
          <div className="text-sm text-gray-600 dark:text-slate-300 mb-3">
            Dial: {formattedCode}
          </div>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Code
          </button>
        </div>

        {/* Nominee Info */}
        <div className="border-t pt-3">
          <div className="text-sm text-gray-600 dark:text-slate-300">
            <div className="font-medium text-gray-800 dark:text-slate-200 mb-1">
              {nomineeName}
            </div>
            <div className="text-xs mb-1">{campaignTitle}</div>
            <Badge variant="secondary" className="text-xs">
              GHS {amountInCedis} per vote
            </Badge>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-gray-600 dark:text-slate-300">
          <div className="font-medium mb-1">How to vote:</div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Dial {formattedCode}</li>
            <li>Follow the prompts</li>
            <li>Confirm payment</li>
            <li>Vote recorded!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

interface USSDCodeGridProps {
  nominees: Array<{
    id: string
    name: string
    ussdCode: string
    campaignTitle: string
    amount: number
  }>
}

export function USSDCodeGrid({ nominees }: USSDCodeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nominees.map((nominee) => (
        <USSDCodeDisplay
          key={nominee.id}
          ussdCode={nominee.ussdCode}
          nomineeName={nominee.name}
          campaignTitle={nominee.campaignTitle}
          amount={nominee.amount}
        />
      ))}
    </div>
  )
}
