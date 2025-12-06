# Email Verification Setup Guide

## 1. Database Function & Trigger (Run in Supabase SQL Editor)

```sql
-- Function to handle post-email-verification setup
CREATE OR REPLACE FUNCTION handle_email_verified()
RETURNS TRIGGER AS $$
DECLARE
  pending_join_data JSONB;
  trip_id_val UUID;
  join_code_id_val UUID;
BEGIN
  -- Only proceed if email was just confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    
    -- Get pending join data from user metadata
    pending_join_data := NEW.raw_user_meta_data->'pending_join';
    
    IF pending_join_data IS NOT NULL THEN
      trip_id_val := (pending_join_data->>'trip_id')::UUID;
      join_code_id_val := (pending_join_data->>'join_code_id')::UUID;
      
      -- Create or update profile
      INSERT INTO public.profiles (user_id, auth_role, updated_at)
      VALUES (NEW.id, NULL, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET updated_at = NOW();
      
      -- Increment trip group_size
      UPDATE public.trips
      SET group_size = group_size + 1
      WHERE id = trip_id_val;
      
      -- Increment join code uses_count
      UPDATE public.trip_join_codes
      SET uses_count = uses_count + 1
      WHERE id = join_code_id_val;
      
      -- Create trip membership
      INSERT INTO public.trip_memberships (trip_id, user_id)
      VALUES (trip_id_val, NEW.id)
      ON CONFLICT (trip_id, user_id) DO NOTHING;
      
      -- Clear pending join data from metadata
      UPDATE auth.users
      SET raw_user_meta_data = raw_user_meta_data - 'pending_join'
      WHERE id = NEW.id;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for email confirmation
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_email_verified();
```

## 2. Supabase Dashboard Configuration

### Enable Email Confirmations
1. Go to **Authentication > Settings** in Supabase Dashboard
2. Scroll to **Email Auth**
3. Enable **Enable email confirmations**

### Configure Email Templates
1. Go to **Authentication > Email Templates**
2. Select **Confirm signup** template
3. **CRITICAL:** Update the link to use your app's deep link scheme directly:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup">Confirm your email</a></p>
```

**Important Notes:**
- `{{ .SiteURL }}` will be replaced with your Site URL (should be `ummrah-app://`)
- `{{ .TokenHash }}` is the verification token
- `type=signup` tells Supabase this is an email confirmation
- This creates a link like: `ummrah-app://auth/callback?token_hash=xxx&type=signup`
- Your app will open directly, not the browser!

### Set Site URL
1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your app's deep link scheme:
   - `ummrah-app://` (matches your app.json scheme)
3. Add **Redirect URLs**:
   - `ummrah-app://auth/callback`
   - `exp://localhost:8081/auth/callback` (for Expo Go development)
   - `exp://192.168.x.x:8081/auth/callback` (replace with your local IP for testing on device)
   - Your production URLs when deployed

## 3. Update Supabase Client Configuration

In your `lib/supabase.ts`, make sure you have proper redirect handling:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

## 4. Deep Linking Setup (React Native / Expo)

Your `app.json` already has the scheme set up:
```json
{
  "expo": {
    "scheme": "ummrah-app"
  }
}
```

This means links like `ummrah-app://auth/callback` will open your app!

For production (when you build the app), you may also want to add universal links:

```json
{
  "expo": {
    "scheme": "ummrah-app",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "your-domain.com",
              "pathPrefix": "/auth/callback"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": [
        "applinks:your-domain.com"
      ]
    }
  }
}
```

## 5. Testing the Flow

1. **Signup**: User enters email and password
2. **Email Sent**: Verification email is sent with link
3. **Click Link**: User clicks verification link in email
4. **Redirect**: User is redirected to `/auth/callback`
5. **Trigger Fires**: Database trigger creates profile and adds user to trip
6. **App Opens**: User is redirected to `/(tabs)` and is fully set up

## 6. Troubleshooting

### Links not working from email on mobile

**If testing with Expo Go:**
- Deep links (`ummrah-app://`) don't work with Expo Go
- The code automatically uses `exp://` links when running in Expo Go
- Make sure the `exp://` URL is added to Supabase Redirect URLs
- Get your local IP: run `ifconfig | grep "inet " | grep -v 127.0.0.1` in terminal
- Add `exp://YOUR-LOCAL-IP:8081/auth/callback` to Supabase Redirect URLs

**If testing with development build or production:**
- Deep links should work
- Make sure `ummrah-app://auth/callback` is in Supabase Redirect URLs
- Test the deep link manually: In iOS, use `xcrun simctl openurl booted ummrah-app://auth/callback`
- On Android: `adb shell am start -a android.intent.action.VIEW -d "ummrah-app://auth/callback"`

**Check Supabase Configuration:**
1. Go to Authentication → URL Configuration
2. **Site URL** should be: `ummrah-app://` (THIS IS CRITICAL - must be your app scheme, not a web URL)
3. Redirect URLs should include:
   - `ummrah-app://auth/callback`
   - `ummrah-app://**`
   - For Expo Go testing:
     - `exp://localhost:8081/auth/callback`
     - `exp://YOUR-LOCAL-IP:8081/auth/callback`

**Check Email Template:**
- Email template must use: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
- This creates a deep link that opens your app directly
- If Site URL is wrong (e.g., `https://...`), links will open in browser

### Email not sending
- Check Supabase logs in Dashboard > Logs
- Verify email confirmations are enabled
- Check spam folder

### Trigger not firing
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users';

-- Check function exists
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'handle_email_verified';

-- Test manually
SELECT handle_email_verified();
```

### User not being added to trip
- Check user metadata has `pending_join` data
- Verify trip_id and join_code_id are valid UUIDs
- Check database logs for errors

## 7. Remove Old handle_new_user Trigger (IMPORTANT!)

Since we're now using email verification, you should remove the old trigger that was causing signup errors:

```sql
-- Remove old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
```

This ensures that profile creation happens ONLY after email verification, not during signup.
