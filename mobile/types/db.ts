
export type AuthRole = 'super_admin';

export type TripVisibility =
  | 'draft'
  | 'published'
  | 'hidden';

export type TripStatus =
  | 'active'
  | 'completed';


// ==========================
// PROFILE (auth-level roles)
// ==========================

export interface ProfileRow {
  user_id: string;

  photo: string | null;
  country: string | null;
  city: string | null;

  date_of_birth: string | null;
  medical_notes: string | null;
  dietary_restrictions: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;

  // AUTH-WIDE ROLE — single highest privilege
  auth_role: AuthRole | null;  // null = normal authenticated user

  profile_visible: boolean;

  updated_at: string;
}


// ==========================
// GROUPS
// ==========================

export interface GroupRow {
  id: string;
  name: string;
  logo_url: string | null;
  phone_number: string | null;
  whatsapp_link: string | null;

  created_by: string;
  created_at: string;
  updated_at: string;
}


// ==========================
// GROUP MEMBERSHIPS
// (no roles here)
// ==========================

export interface GroupMembershipRow {
  id: string;
  group_id: string;
  user_id: string;

  created_at: string;
  updated_at: string;
}


// ==========================
// TRIPS
// ==========================

export interface TripRow {
  id: string;
  group_id: string;
  name: string;

  start_date: string | null;
  end_date: string | null;

  cities: string[];    // fixed from "array"

  visibility: TripVisibility;
  status: TripStatus;

  group_size: number;

  created_at: string;
  updated_at: string;
}


// ==========================
// TRIP MEMBERSHIPS
// (no roles here)
// ==========================

export interface TripMembershipRow {
  id: string;
  trip_id: string;
  user_id: string;

  joined_at: string;
  left_at: string | null;
}


// ==========================
// JOIN CODES
// ==========================

export interface TripJoinCodeRow {
  id: string;
  trip_id: string;

  code: string;
  is_active: boolean;

  expires_at: string | null;
  join_limit: number | null;

  uses_count: number;

  created_at: string;
}


// ==========================
// ITINERARY ITEMS
// ==========================

export interface ItineraryItemRow {
  id: string;
  trip_id: string;

  day_date: string | null;
  title: string;
  description: string | null;
  link_url: string | null;
  location: string | null;

  starts_at: string | null;
  ends_at: string | null;

  created_at: string;
  updated_at: string;
}


// ==========================
// ANNOUNCEMENTS
// ==========================

export interface AnnouncementRow {
  id: string;
  trip_id: string;

  title: string;
  body: string;

  link_url: string | null;
  is_high_priority: boolean;

  scheduled_for: string | null;
  sent_at: string | null;

  created_by: string | null;

  created_at: string;
}
