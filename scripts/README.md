# Database Scripts

This folder contains all the SQL scripts needed to set up and maintain the Towaba voting app database.

## 📋 Scripts Overview

### 🚀 **Initial Setup**
- **`database-setup.sql`** - Complete database schema creation
  - Creates all tables (users, campaigns, categories, nominees, payments, votes)
  - Sets up foreign key relationships
  - Adds indexes and triggers
  - Includes sample data

### 🔄 **Database Updates**
- **`update-database-anonymous.sql`** - Enables anonymous voting
  - Makes user_id nullable for payments and votes
  - Adds voter_name columns
  - Removes user constraints for public voting

- **`update-database-organizer-voting.sql`** - Organizer accounts + anonymous voting
  - Keeps organizer_id constraint for campaigns
  - Makes user_id nullable for payments and votes
  - Adds voter_name for anonymous voters

- **`update-database-supabase-auth.sql`** - Full Supabase Auth integration
  - Removes password column from users table
  - Creates trigger for automatic user profile creation
  - Enables anonymous voting
  - **RECOMMENDED** - Use this for production

### 🗄️ **Storage Setup**
- **`setup-storage.sql`** - Supabase Storage configuration
  - Creates `campaign-images` bucket
  - Sets up public access policies
  - Configures file size limits (5MB)
  - Allows authenticated uploads

## 🎯 **Usage Order**

### **First Time Setup:**
1. Run `database-setup.sql` to create the base schema
2. Run `update-database-supabase-auth.sql` for Supabase Auth
3. Run `setup-storage.sql` for image uploads

### **Existing Database:**
- If you have an older version, run the appropriate update script
- `update-database-supabase-auth.sql` is the most current version

## ⚠️ **Important Notes**

- **Backup your database** before running any scripts
- Run scripts in the Supabase SQL Editor
- Some scripts may require admin privileges
- The `update-database-supabase-auth.sql` script is the most current and recommended

## 🔧 **Troubleshooting**

- **Permission errors**: Some scripts may require admin access
- **Duplicate policies**: Use `DROP POLICY IF EXISTS` if policies already exist
- **Storage bucket exists**: The storage script handles duplicates gracefully

## 📁 **File Structure**

```
scripts/
├── README.md                           # This file
├── database-setup.sql                  # Initial schema
├── update-database-anonymous.sql       # Anonymous voting
├── update-database-organizer-voting.sql # Organizer + voting
├── update-database-supabase-auth.sql   # Full Supabase Auth
└── setup-storage.sql                   # Storage configuration
```

## 🚀 **Quick Start**

1. **Copy the script content** from the file you need
2. **Paste into Supabase SQL Editor**
3. **Run the script**
4. **Check the success message**

For questions or issues, refer to the main project documentation.
