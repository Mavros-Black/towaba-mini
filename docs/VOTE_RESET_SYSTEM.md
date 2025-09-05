# 🗳️ Vote Reset System - Complete Implementation Guide

## 📋 Overview

The Vote Reset System allows organizers to reset votes for new periods while preserving all historical data. This system supports 4 different reset options:

1. **Manual Reset** - One-time reset triggered by organizer
2. **Weekly Auto-Reset** - Automatic reset every 7 days
3. **Monthly Auto-Reset** - Automatic reset every month
4. **Custom Auto-Reset** - Automatic reset with custom interval (1-365 days)

## 🗄️ Database Schema

### New Tables Created

#### 1. `voting_periods`
Stores information about each voting period:
```sql
- id (UUID, Primary Key)
- campaign_id (UUID, Foreign Key to campaigns)
- period_number (Integer, Sequential: 1, 2, 3...)
- start_date (Timestamp)
- end_date (Timestamp)
- total_votes (Integer)
- total_revenue (BigInt)
- total_voters (Integer)
- winner_nominee_id (UUID, Foreign Key to nominees)
- winner_votes (Integer)
- status (String: 'active', 'completed', 'cancelled')
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 2. `period_vote_summary`
Stores nominee performance per period:
```sql
- id (UUID, Primary Key)
- period_id (UUID, Foreign Key to voting_periods)
- nominee_id (UUID, Foreign Key to nominees)
- total_votes (Integer)
- total_revenue (BigInt)
- unique_voters (Integer)
- rank (Integer)
- percentage (Decimal)
- created_at (Timestamp)
```

#### 3. `period_reset_logs`
Audit trail for all reset actions:
```sql
- id (UUID, Primary Key)
- campaign_id (UUID, Foreign Key to campaigns)
- period_id (UUID, Foreign Key to voting_periods)
- reset_type (String: 'manual', 'auto_weekly', 'auto_monthly', 'auto_custom')
- reset_triggered_by (UUID, organizer_id or null for system)
- reset_triggered_at (Timestamp)
- previous_period_stats (JSONB)
- new_period_stats (JSONB)
- notes (Text)
```

### Modified Tables

#### `campaigns` table additions:
```sql
- voting_period_type (String: 'continuous', 'weekly', 'monthly', 'custom')
- current_period_start (Timestamp)
- current_period_end (Timestamp)
- auto_reset_enabled (Boolean)
- reset_frequency (String: 'manual', 'weekly', 'monthly', 'custom')
- custom_reset_days (Integer, for custom frequency)
- next_auto_reset (Timestamp)
```

#### `votes` table additions:
```sql
- voting_period_id (String, unique identifier for period)
- period_start_date (Timestamp)
- period_end_date (Timestamp)
- period_number (Integer)
```

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Execute the SQL script to create all necessary tables and columns:

```bash
# Run this in your Supabase SQL editor
psql -f scripts/create-voting-periods-schema.sql
```

### Step 2: Environment Variables

Add the following to your `.env.local` file:

```env
# For auto-reset cron job security
CRON_SECRET=your-secure-random-string-here
```

### Step 3: Set Up Auto-Reset Cron Job

#### Option A: Vercel Cron Jobs (Recommended)

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-reset-votes",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Set up a cron job to call:
```
POST https://your-app.vercel.app/api/cron/auto-reset-votes
Authorization: Bearer your-cron-secret
```

Recommended schedule: Every 6 hours (`0 */6 * * *`)

### Step 4: Deploy and Test

1. Deploy your application
2. Create a test campaign
3. Add some test votes
4. Test manual reset functionality
5. Test auto-reset by setting a custom frequency

## 🎯 Usage Guide

### For Organizers

#### 1. Setting Up Vote Resets

1. Go to your campaign view page
2. Scroll to "Vote Management" section
3. Click "Reset Votes for New Period"
4. Choose your reset type:
   - **Manual**: One-time reset
   - **Weekly**: Auto-reset every 7 days
   - **Monthly**: Auto-reset every month
   - **Custom**: Auto-reset with your chosen interval

#### 2. Viewing Historical Data

1. Click "View Periods" button in campaign view
2. See all historical periods and their results
3. Export period data as CSV
4. View analytics and comparisons

#### 3. Monitoring Auto-Resets

- Check the "Next auto-reset" time in the vote management section
- View reset logs in the periods page
- Receive notifications when resets occur

### For Developers

#### API Endpoints

##### Manual Reset
```
POST /api/organizer/campaigns/[id]/reset-votes
Body: {
  "resetType": "manual" | "weekly" | "monthly" | "custom",
  "customDays": number, // for custom type
  "notes": string
}
```

##### Get Period Data
```
GET /api/organizer/campaigns/[id]/reset-votes
Returns: Current period info and historical periods
```

##### View All Periods
```
GET /api/organizer/campaigns/[id]/periods
Returns: Detailed period data with analytics
```

##### Test Auto-Reset
```
POST /api/organizer/campaigns/[id]/test-auto-reset
Body: {} // Uses campaign's current auto-reset settings
```

##### Auto-Reset Cron
```
POST /api/cron/auto-reset-votes
Headers: {
  "Authorization": "Bearer your-cron-secret"
}
```

## 📊 Analytics Features

### Period Comparison Charts
- Line charts showing votes, revenue, and voters across periods
- Bar charts for revenue comparison
- Pie charts for nominee vote distribution

### Export Functionality
- CSV export of period results
- Detailed nominee performance data
- Revenue breakdowns

### Historical Views
- Complete audit trail of all resets
- Period-by-period performance tracking
- Winner identification per period

## 🔧 Troubleshooting

### Common Issues

#### 1. Auto-Reset Not Working
- Check if `auto_reset_enabled` is true in campaigns table
- Verify cron job is running and calling the correct endpoint
- Check `next_auto_reset` timestamp is in the past
- Review server logs for errors

#### 2. Missing Period Data
- Ensure the database migration was run completely
- Check if existing votes have `voting_period_id` populated
- Run the period summary calculation manually if needed

#### 3. Permission Errors
- Verify organizer owns the campaign
- Check authentication tokens are valid
- Ensure proper API endpoint permissions

### Debug Commands

```sql
-- Check campaigns with auto-reset enabled
SELECT id, title, reset_frequency, next_auto_reset, auto_reset_enabled 
FROM campaigns 
WHERE auto_reset_enabled = true;

-- Check recent reset logs
SELECT * FROM period_reset_logs 
ORDER BY reset_triggered_at DESC 
LIMIT 10;

-- Check period data
SELECT c.title, vp.period_number, vp.status, vp.total_votes, vp.total_revenue
FROM voting_periods vp
JOIN campaigns c ON vp.campaign_id = c.id
ORDER BY vp.created_at DESC;
```

## 🎉 Benefits

### For Organizers
- ✅ Fresh start each period without losing data
- ✅ Flexible reset schedules (weekly, monthly, custom)
- ✅ Complete historical tracking
- ✅ Detailed analytics and comparisons
- ✅ Export capabilities for reporting

### For Voters
- ✅ Fair competition with fresh starts
- ✅ Clear period indicators
- ✅ Previous period results visibility

### For Platform
- ✅ Increased engagement with regular resets
- ✅ Better data organization
- ✅ Enhanced analytics capabilities
- ✅ Audit trail for compliance

## 🔮 Future Enhancements

### Planned Features
- Email notifications for reset events
- SMS notifications for organizers
- Advanced analytics with machine learning
- Integration with external reporting tools
- Mobile app notifications
- Custom reset schedules (e.g., every 2 weeks)

### API Extensions
- Webhook support for reset events
- Real-time notifications via WebSocket
- Bulk reset operations
- Advanced filtering and search

---

## 📞 Support

For technical support or questions about the Vote Reset System:

1. Check the troubleshooting section above
2. Review server logs for error details
3. Test with a small campaign first
4. Contact the development team with specific error messages

The system is designed to be robust and handle edge cases gracefully, but always test thoroughly before using in production!
