"use client"

import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Award } from 'lucide-react'

export default function OrganizerVotersPage() {
  return (
    <DashboardWrapper title="Voters">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Voters</h1>
        <p className="text-muted-foreground mt-2">
          View statistics and insights about your campaign voters. Note: Voters don't need to register - they simply find campaigns, explore categories, and vote directly.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Voters</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              In the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Campaign</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Most votes received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Voter Information */}
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">How Voters Participate</h3>
          <p className="text-muted-foreground mb-4">
            Voters can participate in your campaigns without creating accounts. Here's how they engage:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">1. Find Campaigns</h4>
              <p className="text-sm text-muted-foreground">
                Voters browse available campaigns by name or category to find ones they're interested in.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">2. Explore Categories</h4>
              <p className="text-sm text-muted-foreground">
                They view different voting categories within campaigns and read nominee information.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">3. Vote Directly</h4>
              <p className="text-sm text-muted-foreground">
                Voters select their preferred nominees and cast votes immediately without registration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardWrapper>
  )
}
