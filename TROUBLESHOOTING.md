# 🔧 Environment Variable Troubleshooting

## 🚨 Common Issues & Solutions

### 1. **"supabaseKey is required" Error**

This error occurs when the Supabase client can't find the required environment variables.

**Possible Causes:**
- `.env.local` file doesn't exist
- Environment variables have wrong names
- File format issues
- Development server not restarted

**Solutions:**

#### A. Check File Location
Make sure `.env.local` is in your **project root** (same directory as `package.json`):

```
your-project/
├── package.json
├── .env.local          ← HERE
├── app/
├── components/
└── lib/
```

#### B. Check Variable Names
Your `.env.local` should have **exactly** these names:

```bash
# ✅ CORRECT - No spaces around =
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ❌ WRONG - Spaces around =
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### C. Check File Format
- **No quotes** around values
- **No semicolons** at the end
- **No extra spaces** or tabs
- **UTF-8 encoding**

```bash
# ✅ CORRECT
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# ❌ WRONG
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co;
```

### 2. **Environment Variables Not Loading**

**Solution: Restart Development Server**

```bash
# 1. Stop the server (Ctrl+C)
# 2. Restart it
npm run dev
# or
yarn dev
```

**Why?** Next.js only loads `.env.local` when the server starts.

### 3. **Check Your .env.local Content**

Visit `/test-supabase` to see the debug information. The `EnvDebug` component will show:

- ✅ **Green badges**: Variables are loaded correctly
- ❌ **Red badges**: Variables are missing
- 🔄 **Refresh button**: Re-check variables

### 4. **File Permission Issues**

Make sure `.env.local` is readable:

```bash
# Check file permissions
ls -la .env.local

# Should show: -rw-r--r--
```

### 5. **Hidden Characters**

Sometimes text editors add hidden characters. Try recreating the file:

```bash
# 1. Delete .env.local
rm .env.local

# 2. Create new file
touch .env.local

# 3. Add content manually (copy-paste from Supabase dashboard)
```

### 6. **Verify Supabase Values**

Go to [Supabase Dashboard](https://supabase.com/dashboard):

1. **Select your project**
2. **Settings → API**
3. **Copy the exact values** (no extra spaces)

### 7. **Test Environment Variables**

Add this to any page temporarily to debug:

```tsx
<div className="p-4 bg-gray-100 rounded">
  <h3>Debug Info:</h3>
  <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
  <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}</p>
</div>
```

## 🔍 Debugging Steps

### Step 1: Check File Exists
```bash
ls -la .env.local
```

### Step 2: Check File Content
```bash
cat .env.local
```

### Step 3: Check Variable Names
Look for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Restart Server
```bash
npm run dev
```

### Step 5: Check Browser Console
Look for error messages about missing variables.

### Step 6: Visit `/test-supabase`
Use the debug components to see what's happening.

## 📱 Still Having Issues?

1. **Check the browser console** for specific error messages
2. **Visit `/test-supabase`** to see debug information
3. **Verify your Supabase project** is active and accessible
4. **Check your Supabase API keys** are correct
5. **Try creating a new `.env.local`** file from scratch

## 🆘 Get Help

If you're still stuck:

1. **Share the error message** from browser console
2. **Share the output** from `/test-supabase` page
3. **Check if your Supabase project** is working
4. **Verify your API keys** are current and valid

Remember: Environment variables are loaded at **build time** and **server start time**, not when you edit the file!
