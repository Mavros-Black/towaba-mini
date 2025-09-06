# 🚀 Supabase Setup Guide

## 🔑 Environment Variables Required

You need to create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 📍 How to Get These Values

### 1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
### 2. Select your project (or create a new one)
### 3. Go to Settings → API
### 4. Copy the values:

- **Project URL**: `https://your-project-id.supabase.co`
- **anon/public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (example format)
- **service_role key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (example format)

## 📁 Create .env.local File

1. **In your project root directory**, create a file named `.env.local`
2. **Add the environment variables** with your actual values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## ⚠️ Important Notes

- **Never commit** `.env.local` to version control
- **Restart your development server** after adding the file
- The `NEXT_PUBLIC_` prefix is required for client-side access
- The `SUPABASE_SERVICE_ROLE_KEY` is for server-side operations only

## 🔄 After Setup

1. **Restart your Next.js development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Check the browser console** - you should see:
   ```
   ✅ NEXT_PUBLIC_SUPABASE_URL: Set
   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set
   ```

3. **Test the connection** by visiting `/test-supabase`

## 🆘 Troubleshooting

### "supabaseKey is required" Error
- Check that `.env.local` exists in your project root
- Verify the variable names are exactly as shown
- Restart your development server

### "Multiple GoTrueClient instances" Warning
- This is normal and won't affect functionality
- It happens when multiple Supabase clients are created

### Environment Variables Not Loading
- Make sure the file is named `.env.local` (not `.env`)
- Check that there are no spaces around the `=` sign
- Verify the file is in the same directory as `package.json`

## 🗄️ Database Setup

After setting up your environment variables, you'll need to create the database tables. We've provided SQL scripts to make this easy:

### Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the content of `scripts/database-setup.sql` into the editor
4. Click **Run** to execute the script

This will create all the necessary tables for the voting app.

### Step 2: Enable Anonymous Voting

1. In the SQL Editor, copy and paste the content of `scripts/update-database-supabase-auth.sql`
2. Click **Run** to execute the script

This enables anonymous voting while keeping organizer authentication.

### Step 3: Set Up Storage

1. In the SQL Editor, copy and paste the content of `scripts/setup-storage.sql`
2. Click **Run** to execute the script

This creates the storage bucket for campaign images.

**📁 All SQL scripts are now organized in the `scripts/` folder with detailed documentation.**

## 🎯 Next Steps

Once environment variables and database are set up:

1. **Test user registration** at `/organizer/register`
2. **Test user login** at `/login`
3. **Create campaigns** at `/organizer/campaigns/create`

## 📞 Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Next.js Environment Variables Guide](https://nextjs.org/docs/basic-features/environment-variables)
- Check the browser console for detailed error messages
