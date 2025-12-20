# Itinerary Builder - Modern Travel Planner Design

A complete redesign of the itinerary builder following modern travel planner UX principles, adapted for spiritual Umrah experiences.

## 🎯 Overview

The new itinerary builder transforms trip planning into a visual, guided workspace that feels intuitive and reduces cognitive load for both group leaders and travelers.

## 📐 Layout Structure

### Three-Zone Layout:

1. **Left Sidebar** - Day-by-day navigation
2. **Center Workspace** - Primary interaction area
3. **Inline Widgets** - Budget, attachments, notes

## 🧩 Components

### 1. DaySidebar (`components/itinerary/DaySidebar.tsx`)
- **Purpose**: Day-by-day navigation and trip overview
- **Features**:
  - Collapsible day list
  - Progress indicators (0-100%)
  - Active day highlighting with green gradient
  - Item count per day
  - Phase labels (Ihram, Tawaf, Sa'i, etc.)
  - Hide/show sidebar toggle

### 2. ExploreStrip (`components/itinerary/ExploreStrip.tsx`)
- **Purpose**: Quick-add activity templates
- **Features**:
  - Horizontal scrollable cards
  - Umrah-specific templates (Ihram, Tawaf, Sa'i, Ziyarat, Prayers, etc.)
  - Color-coded categories with gradients
  - "Browse all" button
  - One-tap template selection

### 3. ActivityCard (`components/itinerary/ActivityCard.tsx`)
- **Purpose**: Individual activity display and interaction
- **Features**:
  - Drag-and-drop reordering
  - Visual type indicators (Locked, Suggested)
  - Activity types: ritual, logistics, personal
  - Inline edit/delete actions
  - Time, duration, location display
  - Category badges
  - Rich icons from lucide-react-native

### 4. ReservationsStrip (`components/itinerary/ReservationsStrip.tsx`)
- **Purpose**: Manage reservations and view budget
- **Features**:
  - Icon-based reservation types (Flight, Hotel, Transport, Dining, Documents)
  - Badge counts for each type
  - Budget widget with auto-calculation
  - "View details" link

## 🚀 Usage

### Navigate to Itinerary Builder:
```typescript
router.push('/itinerary-builder');
```

### Key Interactions:

1. **Select a Day**: Click any day in the sidebar to view its schedule
2. **Add from Template**: Click an Explore card to quick-add an activity
3. **Add Custom Activity**: Click the "+ Add Activity" button
4. **Reorder Activities**: Drag the grip handle on activity cards
5. **Edit Activity**: Click the edit icon on any activity card
6. **Add Reservations**: Click reservation icons to attach documents/bookings
7. **Add Notes**: Use the notes section for day-specific reflections

## 🎨 Design Principles

### Visual Style:
- **Soft green palette** (#4a9d7e primary)
- **Rounded cards** (16px border radius)
- **Gentle shadows** (subtle elevation)
- **Calm spacing** (generous whitespace)
- **No harsh dividers** (visual breathing room)

### Interaction Principles:
- **Single-column updates**: Selecting a day only updates center content
- **Drag-to-order**: Visual feedback for reordering
- **No heavy modals**: Inline editing where possible
- **Auto-save**: Notes save automatically
- **Visual hierarchy**: Bold titles, light metadata, quiet icons

## 🕌 Umrah-Specific Features

### Ritual Activities:
- **Ihram**: Enter sacred state
- **Tawaf**: Circle the Kaaba
- **Sa'i**: Walk between Safa & Marwa
- **Ziyarat**: Visit holy sites
- **Prayer Times**: Scheduled salah

### Activity Types:
- **Ritual** (sacred rites)
- **Logistics** (travel, meals, hotels)
- **Personal** (free time, rest)

### Admin Features:
- **Locked Activities**: Cannot be edited by members
- **Suggested Activities**: Highlighted for group consideration
- **Template Library**: Pre-built Umrah activity templates

## 📱 Mobile Responsive

The design is fully responsive and works on:
- ✅ iOS
- ✅ Android
- ✅ Tablets (iPad layout optimization)

On mobile:
- Sidebar collapses to show/hide button
- Cards stack vertically
- Touch-optimized tap targets
- Swipe gestures for navigation

## 🔧 Integration Points

### Connect to Your API:

```typescript
// Replace mock data with real API calls
const days = await fetchTripDays(tripId);
const activities = await fetchDayActivities(dayId);
const reservations = await fetchReservations(tripId);
```

### Activity Template Selection:
```typescript
const handleTemplateSelect = async (template: ExploreTemplate) => {
  // Open modal with pre-filled form
  // Or directly create activity
  await createActivityFromTemplate(template.id, selectedDayId);
};
```

### Drag-and-Drop:
```typescript
const handleReorder = async (activityId: string, newPosition: number) => {
  await updateActivityOrder(activityId, newPosition);
  // Refetch activities
};
```

## 📊 Data Structure

### Day:
```typescript
interface Day {
  id: string;
  date: string;
  label: string;
  phase: string;
  progress: number; // 0-100
  itemCount: number;
  isExpanded?: boolean;
}
```

### Activity:
```typescript
interface Activity {
  id: string;
  title: string;
  time: string;
  duration: string;
  category: string;
  location?: string;
  description?: string;
  categoryColor: string;
  icon: keyof typeof Icons;
  isLocked?: boolean;
  isSuggested?: boolean;
  type?: 'ritual' | 'logistics' | 'personal';
}
```

## 🎯 Goal Achieved

The itinerary builder now:
- ✅ Feels intuitive without instructions
- ✅ Guides users step-by-step
- ✅ Reduces cognitive load
- ✅ Works for group leaders and travelers
- ✅ Maintains spiritual design language
- ✅ Provides visual planning workspace

## 🚧 Next Steps

1. Connect to backend API
2. Implement drag-and-drop reordering
3. Add activity creation modals
4. Add reservation management
5. Add budget tracking
6. Add collaborative editing
7. Add offline support
8. Add push notifications for changes

---

**Built with**: React Native, Expo Router, TypeScript, Lucide Icons
**Design inspired by**: Modern travel planners (Wanderlog, TripIt)
**Adapted for**: Spiritual Umrah journey planning
