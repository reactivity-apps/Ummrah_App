# Announcements System Documentation

## Overview

Complete push notification-enabled announcements system for trip communication. Admins can create, schedule, and manage announcements that are sent to all trip members via push notifications.

## Features Implemented

### ✅ Core Functionality
- **CRUD Operations**: Create, read, update, delete announcements
- **Trip Scoping**: All announcements tied to specific trip_id
- **Permission Control**: Only admins/sub_admins can create/edit
- **Push Notifications**: Automatic notifications to all trip members
- **Scheduling**: Schedule announcements for future delivery
- **Priority Marking**: High-priority announcements with visual indicators
- **Real-time Updates**: Live synchronization across all clients
- **Deep Linking**: Notifications open specific announcement detail

### ✅ Security
- Permission checks enforce admin-only write access
- Users can only view announcements for trips they're members of
- Invalid push tokens automatically cleaned up
- No cross-trip announcement access

### ✅ User Experience
- **Admin View**: Full management interface with create/edit/delete
- **User View**: Clean reading interface with priority markers
- **Status Indicators**: Scheduled, Sent, Draft states
- **Time Formatting**: "2 hours ago" human-readable timestamps
- **Link Support**: Optional URLs with external link indicators
- **Responsive Modals**: Native-feeling create/edit interface

## Database Schema Required

```sql
-- Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link_url TEXT,
    media_reference TEXT,
    is_high_priority BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES profiles(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push tokens table
CREATE TABLE push_tokens (
    user_id UUID PRIMARY KEY REFERENCES profiles(user_id) ON DELETE CASCADE,
    push_token TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_announcements_trip_id ON announcements(trip_id);
CREATE INDEX idx_announcements_scheduled ON announcements(scheduled_for) WHERE sent_at IS NULL;
CREATE INDEX idx_announcements_sent_at ON announcements(sent_at);
CREATE INDEX idx_push_tokens_token ON push_tokens(push_token);

-- Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read announcements for their trips
CREATE POLICY "Users can view trip announcements"
    ON announcements FOR SELECT
    USING (
        trip_id IN (
            SELECT trip_id FROM trip_memberships
            WHERE user_id = auth.uid() AND left_at IS NULL
        )
    );

-- Policy: Admins can manage announcements for their trips
CREATE POLICY "Admins can manage trip announcements"
    ON announcements FOR ALL
    USING (
        trip_id IN (
            SELECT trip_id FROM trip_memberships
            WHERE user_id = auth.uid() 
            AND role IN ('group_owner', 'super_admin')
            AND left_at IS NULL
        )
    );

-- Policy: Users can manage their own push tokens
CREATE POLICY "Users manage own push tokens"
    ON push_tokens FOR ALL
    USING (user_id = auth.uid());
```

## File Structure

```
mobile/
├── lib/api/
│   ├── services/
│   │   ├── announcement.service.ts          # Core CRUD operations
│   │   └── pushNotification.service.ts      # Push notification handling
│   ├── hooks/
│   │   └── useAnnouncements.ts              # React hook for announcements
│   └── utils/
│       └── announcementScheduler.ts         # Background scheduler
├── components/
│   └── AnnouncementsManager.tsx             # Admin management UI
└── app/
    └── announcements.tsx                     # User-facing screen
```

## Usage Guide

### For Admins

#### Creating an Announcement

```typescript
import { useAnnouncements } from '@/lib/api/hooks/useAnnouncements';

function AdminPanel() {
    const { createItem } = useAnnouncements({ tripId: 'abc123', adminView: true });
    
    const handleCreate = async () => {
        const success = await createItem({
            trip_id: 'abc123',
            title: 'Important Update',
            body: 'Please meet at the lobby at 9 AM tomorrow.',
            is_high_priority: true,
            // scheduled_for: '2025-12-01T09:00:00Z', // Optional scheduling
        });
        
        if (success) {
            // Announcement created and push notifications sent!
        }
    };
}
```

#### Scheduling an Announcement

```typescript
const handleSchedule = async () => {
    const scheduledTime = new Date('2025-12-01T09:00:00Z');
    
    await createItem({
        trip_id: 'abc123',
        title: 'Tomorrow\'s Schedule',
        body: 'Remember to be ready by 8 AM',
        scheduled_for: scheduledTime.toISOString(),
    });
    
    // Will automatically send at scheduled time
};
```

### For Users

```typescript
import { useAnnouncements } from '@/lib/api/hooks/useAnnouncements';

function UserAnnouncementsScreen({ tripId }: { tripId: string }) {
    const { announcements, loading } = useAnnouncements({ 
        tripId, 
        adminView: false // Only see sent announcements
    });
    
    return (
        <View>
            {announcements.map(announcement => (
                <AnnouncementCard key={announcement.id} {...announcement} />
            ))}
        </View>
    );
}
```

### Push Notification Setup

#### Initialize on App Start

```typescript
import { 
    requestPushNotificationPermissions, 
    configureNotifications 
} from '@/lib/api/services/pushNotification.service';

// In App.tsx or _layout.tsx
useEffect(() => {
    // Configure notification behavior
    configureNotifications();
    
    // Request permissions and register token
    requestPushNotificationPermissions();
}, []);
```

#### Handle Notification Taps

```typescript
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

useEffect(() => {
    // Handle notification tap
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        
        if (data.type === 'announcement') {
            router.push(`/announcements/${data.announcementId}`);
        }
    });
    
    return () => subscription.remove();
}, []);
```

### Background Scheduler Setup

#### Option 1: Simple Interval (Development)

```typescript
import { startPeriodicScheduler } from '@/lib/api/utils/announcementScheduler';

// Run every 15 minutes
const stopScheduler = startPeriodicScheduler(15);

// Clean up when done
// stopScheduler();
```

#### Option 2: Production Background Task (Recommended)

```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { runAnnouncementScheduler } from '@/lib/api/utils/announcementScheduler';

const TASK_NAME = 'announcement-scheduler';

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        await runAnnouncementScheduler();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerScheduler() {
    return BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
    });
}
```

## API Reference

### announcement.service.ts

#### `getAnnouncementsForTrip(tripId: string)`
Fetch all announcements for a trip (admin view - includes drafts/scheduled)

#### `getVisibleAnnouncementsForTrip(tripId: string)`
Fetch only sent announcements (user view)

#### `createAnnouncement(input: AnnouncementInput)`
Create new announcement. Sends push notifications if not scheduled.

#### `updateAnnouncement(announcementId: string, updates: Partial<AnnouncementInput>)`
Update announcement. Cannot edit already-sent announcements.

#### `deleteAnnouncement(announcementId: string)`
Delete announcement (admin only)

#### `sendScheduledAnnouncement(announcementId: string)`
Manually trigger a scheduled announcement to send now

#### `processScheduledAnnouncements()`
Check for and send all due scheduled announcements (called by scheduler)

### pushNotification.service.ts

#### `requestPushNotificationPermissions()`
Request permissions and register device token with backend

#### `registerPushToken(userId: string, pushToken: string)`
Store/update user's push token

#### `sendAnnouncementPushNotifications(announcement: AnnouncementRow)`
Send push notifications to all trip members for an announcement

#### `configureNotifications()`
Set up notification handling behavior

### useAnnouncements Hook

```typescript
const {
    announcements,      // Array of announcements
    loading,           // Loading state
    error,             // Error message
    isAdmin,           // Current user admin status
    createItem,        // Create announcement
    updateItem,        // Update announcement
    deleteItem,        // Delete announcement
    sendNow,           // Send scheduled announcement now
    refresh,           // Reload announcements
} = useAnnouncements({ tripId, adminView?, enableRealtime? });
```

## Push Notification Flow

```
1. Admin creates announcement
   ↓
2. Service checks if scheduled
   ↓
3a. If immediate: Mark sent_at = now
   ↓
4. Fetch all trip members
   ↓
5. Get push tokens for members
   ↓
6. Batch send notifications (100 per batch)
   ↓
7. Handle invalid tokens (clean up)
   ↓
8. Users receive notification
   ↓
9. Tap opens announcement detail

3b. If scheduled: Store with scheduled_for timestamp
   ↓
4. Background scheduler runs every 15 min
   ↓
5. Finds announcements where scheduled_for <= now
   ↓
6. Updates sent_at = now
   ↓
7. Triggers push notifications (step 4-9 above)
```

## Security Checklist

✅ All announcements scoped by trip_id
✅ Permission checks on all mutations
✅ Users can only see announcements for their trips
✅ RLS policies on database tables
✅ Invalid push tokens automatically cleaned
✅ Cannot edit already-sent announcements
✅ Batch sending prevents spam/overload

## Performance Optimizations

- **Batched Push Sending**: 100 notifications per batch with delays
- **Parallel Fetching**: Trip members and tokens fetched concurrently
- **Real-time Updates**: Instant UI updates without refetching
- **Indexed Queries**: Database indexes on trip_id, scheduled_for, sent_at
- **Token Cleanup**: Automatic removal of invalid/expired tokens

## Testing Checklist

- [ ] Admin can create immediate announcement → all members notified
- [ ] Admin can schedule announcement → sends at correct time
- [ ] High priority shows visual indicators
- [ ] Users cannot create/edit announcements
- [ ] Users only see announcements for their trips
- [ ] Invalid tokens cleaned up after send failure
- [ ] Deep links open correct announcement
- [ ] Real-time updates work across devices
- [ ] Scheduled announcements process correctly
- [ ] Cannot edit sent announcements

## Future Enhancements

- **Read Tracking**: Track which users have read each announcement
- **Rich Media**: Support images/videos in announcements
- **Categories**: Tag announcements (info, warning, update, etc.)
- **Reactions**: Let users react to announcements
- **Thread Replies**: Allow discussion on announcements
- **Analytics**: Track open rates, engagement
- **Localization**: Multi-language support
- **Templates**: Pre-built announcement templates
- **User Preferences**: Per-user notification settings

## Troubleshooting

### Push Notifications Not Sending

1. Check Expo push token is valid (starts with `ExponentPushToken[...]`)
2. Verify push_tokens table has entries
3. Check user is member of trip
4. Verify Expo project is properly configured
5. Test with Expo's push notification tool

### Scheduled Announcements Not Triggering

1. Ensure background scheduler is running
2. Check scheduled_for timestamp is in past
3. Verify sent_at is null
4. Check scheduler logs for errors

### Users Not Seeing Announcements

1. Verify user is trip member (left_at IS NULL)
2. Check announcement has sent_at timestamp
3. Verify RLS policies are correct
4. Check real-time subscription is active
