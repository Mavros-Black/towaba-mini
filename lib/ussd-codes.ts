import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate a unique 4-digit USSD code for a nominee
 * Format: 1000-9999 (avoiding 0000-0999 for clarity)
 */
export async function generateUniqueUSSDCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 100

  while (attempts < maxAttempts) {
    // Generate a random 4-digit code between 1000-9999
    const code = Math.floor(Math.random() * 9000) + 1000
    const codeString = code.toString()

    // Check if this code is already in use
    const { data: existingNominee, error } = await supabase
      .from('nominees')
      .select('id')
      .eq('ussd_code', codeString)
      .single()

    if (error && error.code === 'PGRST116') {
      // No existing nominee found with this code - it's unique!
      return codeString
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking USSD code uniqueness:', error)
      throw new Error('Failed to check USSD code uniqueness')
    }

    attempts++
  }

  throw new Error('Unable to generate unique USSD code after maximum attempts')
}

/**
 * Generate multiple unique USSD codes for a batch of nominees
 */
export async function generateBatchUSSDCodes(count: number): Promise<string[]> {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    const code = await generateUniqueUSSDCode()
    codes.push(code)
  }
  
  return codes
}

/**
 * Validate USSD code format
 */
export function isValidUSSDCode(code: string): boolean {
  // Must be exactly 4 digits and between 1000-9999
  const codeRegex = /^[1-9]\d{3}$/
  return codeRegex.test(code)
}

/**
 * Format USSD code for display
 */
export function formatUSSDCode(code: string): string {
  if (!isValidUSSDCode(code)) {
    return code
  }
  
  // Format as *920*1234# for display
  return `*920*${code}#`
}

/**
 * Extract USSD code from formatted string
 */
export function extractUSSDCode(formattedCode: string): string {
  // Extract 4-digit code from *920*1234# format
  const match = formattedCode.match(/\*920\*(\d{4})#/)
  return match ? match[1] : formattedCode
}
