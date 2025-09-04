"use client"

import { DashboardWrapper } from '@/components/dashboard-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, User, Shield, Bell } from 'lucide-react'

export default function OrganizerSettingsPage() {
  return (
    <DashboardWrapper title="Settings">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" placeholder="Your Name" />
              </div>
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications about your campaigns
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span>Email notifications for new votes</span>
              </Label>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked />
                <span>Campaign completion alerts</span>
              </Label>
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">More Settings Coming Soon</h3>
            <p className="text-muted-foreground">
              Additional customization options will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}
