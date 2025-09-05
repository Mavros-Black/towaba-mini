'use client'

import VoteResetManager from '@/components/vote-reset-manager'

export default function TestVoteResetPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Vote Reset Manager</h1>
      <VoteResetManager 
        campaignId="7f81826e-98c0-4e2a-a1a3-19e55be9846f" 
        campaignTitle="Kumerica" 
      />
    </div>
  )
}
