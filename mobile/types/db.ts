/**
 * Types generated from the database schema
 * - Enum types are exported as string unions
 * - Table rows mirror database column names (snake_case) and use
 *   `string` for timestamp/date/uuid types since these are typically
 *   transferred as ISO strings to the client.
 */

// ENUMS
export type GroupRole = 'admin' | 'sub_admin' | 'traveler';
export type TripVisibility = 'draft' | 'published';
export type ProfileRole = 'admin' | 'sub_admin' | 'traveler'

// ========== PROFILES ==========
export type Profile = {
  user_id: string
  name: string
  phone: string | null
  email: string | null
  emergency_name: string | null
  emergency_phone: string | null
  emergency_notes: string | null
  role: ProfileRole
  created_at: string
  updated_at: string
}

// ========== GROUPS ==========
export interface GroupRow {
  id?: string; // uuid PK
  name: string;
  logo_url?: string | null;
  whatsapp_link?: string | null;
  created_by: string; // uuid → auth.users(id)
  created_at?: string; // timestamptz
}

// ========== TRIPS ==========
export interface TripRow {
  id?: string; // uuid PK
  group_id: string; // uuid → groups(id)
  name: string;
  start_date?: string | null; // date as 'YYYY-MM-DD'
  end_date?: string | null; // date as 'YYYY-MM-DD'
  base_city?: string | null;
  visibility?: TripVisibility;
  created_by?: string | null; // uuid → auth.users(id)
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
}

// ========== TRIP MEMBERSHIPS ==========
export interface TripMembershipRow {
  id?: string; // uuid PK
  trip_id: string; // uuid → trips(id)
  user_id: string; // uuid → auth.users(id)
  role?: GroupRole;
  joined_at?: string; // timestamptz
  left_at?: string | null; // timestamptz
}

// ========== TRIP JOIN CODES ==========
export interface TripJoinCodeRow {
  id?: string; // uuid PK
  trip_id: string; // uuid → trips(id)
  group_id?: string | null; // uuid → groups(id)
  code: string;
  is_active?: boolean;
  expires_at?: string | null; // timestamptz
  join_limit?: number | null;
  uses_count?: number;
  created_at?: string; // timestamptz
}

// ========== ITINERARY ITEMS ==========
export interface ItineraryItemRow {
  id?: string; // uuid PK
  trip_id: string; // uuid → trips(id)
  day_date?: string | null; // date
  title: string;
  description?: string | null;
  location?: string | null;
  starts_at?: string | null; // timestamptz
  ends_at?: string | null; // timestamptz
  sort_order?: number;
  created_by?: string | null; // uuid → auth.users(id)
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
}

// ========== ANNOUNCEMENTS ==========
export interface AnnouncementRow {
  id?: string; // uuid PK
  trip_id: string; // uuid → trips(id)
  title: string;
  body: string;
  link_url?: string | null;
  is_high_priority?: boolean;
  scheduled_for?: string | null; // timestamptz
  sent_at?: string | null; // timestamptz
  created_by?: string | null; // uuid → auth.users(id)
  created_at?: string; // timestamptz
}

// Optional: grouped export for convenience
export const DB = {
  GroupRole: undefined as unknown as GroupRole,
  TripVisibility: undefined as unknown as TripVisibility,
};
