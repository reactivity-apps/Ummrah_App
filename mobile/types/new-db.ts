// -- ==========================
// -- ENUMS
// -- ==========================

// -- Group-level roles
// create type group_role as enum (
//   'group_super_admin',
//   'group_admin',
//   'group_member'
// );

// -- Trip-level roles
// create type trip_member_role as enum (
//   'trip_leader',
//   'trip_assistant',
//   'trip_traveler'
// );

// -- Trip visibility + status
// create type trip_visibility as enum (
//   'draft',
//   'published',
//   'active'
// );

// create type trip_status as enum (
//   'draft',
//   'active',
//   'completed'
// );

// -- ==========================
// -- PROFILES
// -- ==========================
// -- One row per auth user. Identity + optional emergency info.
// -- No roles here.

// create table profiles (
//   user_id         uuid primary key references auth.users(id) on delete cascade,
//   name            text not null,
//   phone           text,
//   email           text,
//   emergency_name  text,
//   emergency_phone text,
//   emergency_notes text,
//   created_at      timestamptz not null default now(),
//   updated_at      timestamptz not null default now()
// );

// -- ==========================
// -- GROUPS (Masjid / Organization / Private Group)
// -- ==========================

// create table groups (
//   id            uuid primary key default gen_random_uuid(),
//   name          text not null,
//   logo_url      text,
//   whatsapp_link text,
//   created_by    uuid not null references auth.users(id) on delete set null,
//   created_at    timestamptz not null default now(),
//   updated_at    timestamptz not null default now()
// );

// -- ==========================
// -- GROUP MEMBERSHIPS
// -- ==========================
// -- Links users to groups with explicit group roles.

// create table group_memberships (
//   id         uuid primary key default gen_random_uuid(),
//   group_id   uuid not null references groups(id) on delete cascade,
//   user_id    uuid not null references auth.users(id) on delete cascade,
//   role       group_role not null default 'group_member',
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now(),

//   unique (group_id, user_id)
// );

// -- ==========================
// -- TRIPS
// -- ==========================
// -- Each trip belongs to exactly one group.

// create table trips (
//   id          uuid primary key default gen_random_uuid(),
//   group_id    uuid not null references groups(id) on delete cascade,
//   name        text not null,
//   start_date  date,
//   end_date    date,
//   base_city   text,
//   visibility  trip_visibility not null default 'draft',
//   status      trip_status not null default 'draft',
//   group_size  integer not null default 0,
//   created_by  uuid references auth.users(id) on delete set null,
//   created_at  timestamptz not null default now(),
//   updated_at  timestamptz not null default now()
// );

// -- ==========================
// -- TRIP MEMBERSHIPS
// -- ==========================
// -- Who is on which trip, and their trip-level role.

// create table trip_memberships (
//   id         uuid primary key default gen_random_uuid(),
//   trip_id    uuid not null references trips(id) on delete cascade,
//   user_id    uuid not null references auth.users(id) on delete cascade,
//   role       trip_member_role not null default 'trip_traveler',
//   joined_at  timestamptz not null default now(),
//   left_at    timestamptz,

//   unique (trip_id, user_id)
// );

// -- ==========================
// -- TRIP JOIN CODES
// -- ==========================
// -- Used to onboard people directly to a specific trip.
// -- No group_id needed because trip → group_id is already known.

// create table trip_join_codes (
//   id          uuid primary key default gen_random_uuid(),
//   trip_id     uuid not null references trips(id) on delete cascade,
//   code        text not null,
//   is_active   boolean not null default true,
//   expires_at  timestamptz,
//   join_limit  integer,
//   uses_count  integer not null default 0,
//   created_at  timestamptz not null default now(),

//   unique (code)
// );

// -- ==========================
// -- ITINERARY ITEMS
// -- ==========================

// create table itinerary_items (
//   id          uuid primary key default gen_random_uuid(),
//   trip_id     uuid not null references trips(id) on delete cascade,
//   day_date    date,
//   title       text not null,
//   description text,
//   link        text,
//   location    text,
//   starts_at   timestamptz,
//   ends_at     timestamptz,
//   sort_order  integer,
//   created_by  uuid references auth.users(id) on delete set null,
//   created_at  timestamptz not null default now(),
//   updated_at  timestamptz not null default now()
// );

// -- ==========================
// -- ANNOUNCEMENTS
// -- ==========================

// create table announcements (
//   id              uuid primary key default gen_random_uuid(),
//   trip_id         uuid not null references trips(id) on delete cascade,
//   title           text not null,
//   body            text not null,
//   link_url        text,
//   is_high_priority boolean not null default false,
//   scheduled_for   timestamptz,
//   sent_at         timestamptz,
//   created_by      uuid references auth.users(id) on delete set null,
//   created_at      timestamptz not null default now()
// );


/**
 * ENUMS
 */

export type GroupRole =
  | 'group_super_admin'
  | 'group_admin'
  | 'group_member';

export type TripMemberRole =
  | 'trip_leader'
  | 'trip_assistant'
  | 'trip_traveler';

export type TripVisibility =
  | 'draft'
  | 'published'
  | 'active';

export type TripStatus =
  | 'draft'
  | 'active'
  | 'completed';

/**
 * PROFILES
 */
export interface ProfileRow {
  user_id: string;          // uuid → auth.users(id)
  name: string;
  phone: string | null;
  email: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_notes: string | null;
  created_at: string;       // ISO timestamptz
  updated_at: string;       // ISO timestamptz
}

/**
 * GROUPS
 */
export interface GroupRow {
  id: string;               // uuid PK
  name: string;
  logo_url: string | null;
  whatsapp_link: string | null;
  created_by: string;       // uuid → auth.users(id)
  created_at: string;       // timestamptz
  updated_at: string;       // timestamptz
}

/**
 * GROUP MEMBERSHIPS
 */
export interface GroupMembershipRow {
  id: string;               // uuid PK
  group_id: string;         // uuid → groups(id)
  user_id: string;          // uuid → auth.users(id)
  role: GroupRole;
  created_at: string;       // timestamptz
  updated_at: string;       // timestamptz
}

/**
 * TRIPS
 */
export interface TripRow {
  id: string;               // uuid PK
  group_id: string;         // uuid → groups(id)
  name: string;
  start_date: string | null; // 'YYYY-MM-DD'
  end_date: string | null;   // 'YYYY-MM-DD'
  base_city: string | null;
  visibility: TripVisibility;
  status: TripStatus;
  group_size: number;
  created_by: string | null; // uuid → auth.users(id)
  created_at: string;        // timestamptz
  updated_at: string;        // timestamptz
}

/**
 * TRIP MEMBERSHIPS
 */
export interface TripMembershipRow {
  id: string;               // uuid PK
  trip_id: string;          // uuid → trips(id)
  user_id: string;          // uuid → auth.users(id)
  role: TripMemberRole;
  joined_at: string;        // timestamptz
  left_at: string | null;   // timestamptz
}

/**
 * TRIP JOIN CODES
 */
export interface TripJoinCodeRow {
  id: string;               // uuid PK
  trip_id: string;          // uuid → trips(id)
  code: string;
  is_active: boolean;
  expires_at: string | null; // timestamptz
  join_limit: number | null;
  uses_count: number;
  created_at: string;        // timestamptz
}

/**
 * ITINERARY ITEMS
 */
export interface ItineraryItemRow {
  id: string;               // uuid PK
  trip_id: string;          // uuid → trips(id)
  day_date: string | null;  // 'YYYY-MM-DD'
  title: string;
  description: string | null;
  link: string | null;
  location: string | null;
  starts_at: string | null; // timestamptz
  ends_at: string | null;   // timestamptz
  sort_order: number | null;
  created_by: string | null; // uuid → auth.users(id)
  created_at: string;        // timestamptz
  updated_at: string;        // timestamptz
}

/**
 * ANNOUNCEMENTS
 */
export interface AnnouncementRow {
  id: string;               // uuid PK
  trip_id: string;          // uuid → trips(id)
  title: string;
  body: string;
  link_url: string | null;
  is_high_priority: boolean;
  scheduled_for: string | null; // timestamptz
  sent_at: string | null;       // timestamptz
  created_by: string | null;    // uuid → auth.users(id)
  created_at: string;           // timestamptz
}

/**
 * Optional grouped export
 */
export const DB = {
  GroupRole: undefined as unknown as GroupRole,
  TripMemberRole: undefined as unknown as TripMemberRole,
  TripVisibility: undefined as unknown as TripVisibility,
  TripStatus: undefined as unknown as TripStatus,
};
