# API Layer Documentation

This directory contains all API services and React hooks for interacting with the Supabase backend.

## Structure

```
lib/api/
├── hooks/              # React hooks for components
├── services/           # Core business logic and data fetching
├── utils/              # Shared utilities and helpers
└── index.ts            # Public API exports
```

## Services

Services handle all database operations and business logic. They are pure TypeScript functions that don't use React.

### **activity.service.ts**
- **Purpose**: Aggregate and track trip activity feed
- **What it does**: Combines member joins, itinerary changes, and announcements into unified activity stream
- **Key functions**:
  - `getTripActivity(tripId, limit)` - Fetch recent activity (last 30 days)
  - `subscribeToTripActivity(tripId, callback)` - Real-time activity updates
- **Used by**: Admin dashboard, activity feeds

### **itinerary.service.ts**
- **Purpose**: Manage trip itinerary items with permission checks
- **What it does**: CRUD operations for itinerary items with admin-only access, optimistic locking, conflict detection
- **Key functions**:
  - `getItineraryForTrip(tripId)` - Fetch all items for a trip
  - `createItineraryItem(input)` - Create new item (admin only)
  - `updateItineraryItem(itemId, updates, lastUpdatedAt)` - Update with conflict detection
  - `deleteItineraryItem(itemId)` - Delete item (admin only)
  - `reorderItineraryItems(reorderData, tripId)` - Bulk reorder
  - `subscribeToItineraryChanges(tripId, callback)` - Real-time updates
- **Used by**: Itinerary manager, admin screens

### **trip.service.ts**
- **Purpose**: Manage trip lifecycle
- **What it does**: Create, update, delete trips with automatic membership creation
- **Key functions**:
  - `createTrip(input)` - Create trip and add creator as admin
  - `updateTrip(tripId, updates)` - Update trip details (admin only)
  - `getUserTrips()` - Fetch all trips for current user
  - `getTripWithMembership(tripId)` - Get trip with user's role
- **Used by**: Trip creation flows, admin screens

### **group.service.ts**
- **Purpose**: Manage groups (organizations that own trips)
- **What it does**: Simple group management, auto-creates default group for new users
- **Key functions**:
  - `getOrCreateDefaultGroup()` - Ensures user has a group to create trips under
- **Used by**: Trip creation, onboarding

## Hooks

Hooks are React-specific wrappers around services. They handle state management, loading states, errors, and real-time subscriptions.

### **useActivity**
- **Purpose**: Subscribe to trip activity updates
- **Parameters**: `{ tripId, limit?, enableRealtime? }`
- **Returns**: `{ activities, loading, error, refresh }`
- **Features**: Automatic real-time updates, manual refresh, deduplication

### **useItinerary**
- **Purpose**: Full-featured itinerary management with real-time sync
- **Parameters**: `{ tripId, enableRealtime?, onError?, onConflict? }`
- **Returns**: `{ items, loading, error, isAdmin, createItem, updateItem, deleteItem, reorderItems, ... }`
- **Features**:
  - Optimistic updates with rollback
  - Conflict detection
  - Permission checking
  - Real-time synchronization
  - Batch operations

### **useUserTrips**
- **Purpose**: Fetch all trips for current user
- **Returns**: `{ trips, adminTrips, currentTrip, loading, error, refresh }`
- **Features**: Separates admin trips, identifies "current" trip

## Shared Utilities (utils/helpers.ts)

### Auth Helpers
- `getCurrentUser()` - Get current authenticated user
- `requireAuth()` - Throw if not authenticated
- `hasAdminPermission(tripId, userId?)` - Check admin status
- `verifyAdminPermission(tripId)` - Detailed permission check

### Time Formatting
- `formatTimeAgo(timestamp)` - Convert ISO timestamp to "2 hours ago"

### Sorting
- `sortItineraryItems(items)` - Standard sort: day_date → sort_order → starts_at

### Error Handling
- `success(data)` - Create success response
- `error(message)` - Create error response
- `handleAsync(operation, errorMsg)` - Wrap operations with try/catch

## Patterns & Best Practices

### 1. Service Functions
- Pure TypeScript, no React hooks
- Return structured responses: `{ success, data?, error? }`
- Always check permissions before mutations
- Use shared helpers to avoid duplication

### 2. React Hooks
- Use services internally, add React-specific features
- Manage loading/error states
- Handle subscriptions with cleanup
- Support optimistic updates when appropriate

### 3. Real-time Subscriptions
- Always return cleanup function
- Use consistent channel naming: `${table}-${id}`
- Handle subscription errors gracefully

### 4. Permission Checks
- Verify admin status before mutations
- Check at service level, not just UI
- Use `verifyAdminPermission` from helpers

### 5. Error Handling
- Log errors with context
- Return user-friendly messages
- Don't expose raw database errors

## Usage Examples

### Fetching Activity
```typescript
const { activities, loading } = useActivity({ tripId: 'abc123' });
```

### Creating Itinerary Item
```typescript
const { createItem } = useItinerary({ tripId: 'abc123' });
await createItem({
  trip_id: 'abc123',
  title: 'Visit Masjid al-Haram',
  day_date: '2025-01-15',
  starts_at: '09:00:00'
});
```

### Checking Permissions
```typescript
import { hasAdminPermission } from './utils/helpers';
const isAdmin = await hasAdminPermission(tripId);
```
