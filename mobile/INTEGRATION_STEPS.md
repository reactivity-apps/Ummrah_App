# Announcements System - Integration Steps

## ✅ Completed
All announcement system code has been implemented:
- 5 service/hook files (1,280 lines)
- 2 UI components (580 lines)  
- 1 scheduler utility (65 lines)
- Complete documentation (450 lines)

## 📋 Next Steps

### 1. Database Setup (REQUIRED FIRST)

Run this SQL in your Supabase SQL editor:

```sql
-- Create announcements table
CREATE TABLE announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link_url TEXT,
    media_reference TEXT,
    is_high_priority BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create push_tokens table
CREATE TABLE push_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    push_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_announcements_trip_id ON announcements(trip_id);
CREATE INDEX idx_announcements_sent_at ON announcements(sent_at);
CREATE INDEX idx_announcements_scheduled_for ON announcements(scheduled_for);
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_token ON push_tokens(push_token);

-- RLS Policies for announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Users can view announcements for trips they're members of
CREATE POLICY "Users can view trip announcements"
    ON announcements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_memberships
            WHERE trip_memberships.trip_id = announcements.trip_id
            AND trip_memberships.user_id = auth.uid()
        )
    );

-- Only admins can create/update/delete announcements
CREATE POLICY "Admins can manage announcements"
    ON announcements FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trip_memberships
            WHERE trip_memberships.trip_id = announcements.trip_id
            AND trip_memberships.user_id = auth.uid()
            AND trip_memberships.is_admin = TRUE
        )
    );

-- RLS Policies for push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own push tokens
CREATE POLICY "Users can manage own push tokens"
    ON push_tokens FOR ALL
    USING (user_id = auth.uid());
```

### 2. App Initialization

Add to your main app entry point (`app/_layout.tsx` or `App.tsx`):

```typescript
import { useEffect } from 'react';
import { requestPushNotificationPermissions, configureNotifications } from '@/lib/api/services/pushNotification.service';

export default function RootLayout() {
    useEffect(() => {
        // Initialize push notifications
        const initPushNotifications = async () => {
            await configureNotifications();
            await requestPushNotificationPermissions();
        };
        
        initPushNotifications();
    }, []);

    // ... rest of your layout
}
```

### 3. Add AnnouncementsManager to Admin Dashboard

In your admin screen (`app/(tabs)/admin.tsx` or similar):

```typescript
import AnnouncementsManager from '@/components/AnnouncementsManager';

export default function AdminScreen() {
    const { tripId } = useLocalSearchParams();
    
    return (
        <ScrollView>
            {/* Your other admin components */}
            
            <AnnouncementsManager tripId={tripId as string} />
        </ScrollView>
    );
}
```

### 4. Add Announcements Screen to Navigation

The user-facing screen is already at `app/announcements.tsx`. Add it to your navigation:

```typescript
// In your tab navigator or stack navigator
<Tab.Screen 
    name="announcements" 
    options={{ 
        title: "Announcements",
        tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" size={size} color={color} />
    }} 
/>
```

### 5. Background Scheduler (Production)

For production, use TaskManager. Add to your app entry point:

```typescript
import * as TaskManager from 'expo-task-manager';
import { processScheduledAnnouncements } from '@/lib/api/services/announcement.service';

const ANNOUNCEMENT_TASK_NAME = 'process-scheduled-announcements';

// Define the background task
TaskManager.defineTask(ANNOUNCEMENT_TASK_NAME, async () => {
    try {
        await processScheduledAnnouncements();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Background task error:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

// Register the task (call once on app startup)
async function registerBackgroundTask() {
    await BackgroundFetch.registerTaskAsync(ANNOUNCEMENT_TASK_NAME, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
    });
}
```

### 6. Deep Link Configuration

Add to your `app.json`:

```json
{
  "expo": {
    "scheme": "ummrah",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "ummrah"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

Handle notification taps in your app:

```typescript
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

const router = useRouter();

useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const announcementId = response.notification.request.content.data.announcementId;
        if (announcementId) {
            router.push(`/announcements?selectedId=${announcementId}`);
        }
    });

    return () => subscription.remove();
}, []);
```

## 🧪 Testing Checklist

- [ ] Run database SQL and verify tables created
- [ ] Test push notification permission request on app launch
- [ ] Create a high-priority announcement (should send immediately)
- [ ] Create a scheduled announcement (check database scheduled_for)
- [ ] Verify push notification received on device
- [ ] Tap notification and verify it opens announcement detail
- [ ] Test admin permissions (non-admins can't create)
- [ ] Test trip scoping (users only see their trip's announcements)
- [ ] Test real-time updates (create announcement in one device, see on another)
- [ ] Test background scheduler (scheduled announcement sends after time)
- [ ] Test external links (tap link in announcement detail)
- [ ] Test priority markers in UI (high-priority shows badge)

## 📚 Documentation

See `ANNOUNCEMENTS_SYSTEM.md` for complete documentation including:
- Full feature overview
- API reference
- Usage examples
- Security details
- Performance optimizations
- Troubleshooting guide

## ⚠️ Important Notes

1. **Push Notifications on iOS**: Requires physical device (won't work in simulator)
2. **Expo Push Tokens**: Only work with Expo Go or builds created with EAS Build
3. **Background Tasks**: May have limitations on iOS (15-30 min intervals)
4. **Database**: Must create tables before using any announcement features
5. **Permissions**: Both push notification and trip admin permissions must be checked

## 🚀 Quick Start (Development)

For quick testing without background tasks:

```typescript
// In app/_layout.tsx
import { startPeriodicScheduler } from '@/lib/api/utils/announcementScheduler';

useEffect(() => {
    // Check every 2 minutes (dev only)
    startPeriodicScheduler(2 * 60 * 1000);
}, []);
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section in `ANNOUNCEMENTS_SYSTEM.md`
2. Verify database schema is set up correctly
3. Check Expo logs for push notification errors
4. Ensure proper RLS policies are enabled
