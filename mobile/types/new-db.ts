// -- ==========================
// -- ENUMS
// -- ==========================

// create type group_role as enum (
//   'group_super_admin',
//   'group_admin',
//   'group_member'
// );

// create type trip_member_role as enum (
//   'trip_leader',
//   'trip_traveler'
// );

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
// -- ONLY DATA NOT IN auth.users
// -- ==========================

// create table profiles (
//   user_id uuid primary key references auth.users(id) on delete cascade,

//   -- public profile
//   display_name text,
//   country text,
//   city text,

//   -- sensitive fields
//   gender text,
//   date_of_birth date,
//   passport_number text,
//   passport_expiry date,
//   blood_type text,
//   medical_notes text,
//   dietary_restrictions text,

//   emergency_contact_name text,
//   emergency_contact_phone text,

//   -- visibility flags
//   passport_visible boolean not null default false,
//   medical_visible boolean not null default false,
//   emergency_visible boolean not null default false,

//   updated_at timestamptz not null default now()
// );

// -- ==========================
// -- GROUPS
// -- ==========================

// create table groups (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   logo_url text,
//   whatsapp_link text,
//   created_by uuid not null references auth.users(id),
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );

// -- ==========================
// -- GROUP MEMBERSHIPS
// -- ==========================

// create table group_memberships (
//   id uuid primary key default gen_random_uuid(),
//   group_id uuid not null references groups(id) on delete cascade,
//   user_id uuid not null references auth.users(id) on delete cascade,
//   role group_role not null default 'group_member',
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now(),
//   unique (group_id, user_id)
// );

// -- ==========================
// -- TRIPS
// -- ==========================

// create table trips (
//   id uuid primary key default gen_random_uuid(),
//   group_id uuid not null references groups(id) on delete cascade,
//   name text not null,
//   start_date date,
//   end_date date,
//   base_city text,
//   visibility trip_visibility not null default 'draft',
//   status trip_status not null default 'draft',
//   group_size integer not null default 0,
//   created_by uuid references auth.users(id),
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );

// -- ==========================
// -- TRIP MEMBERSHIPS
// -- ==========================

// create table trip_memberships (
//   id uuid primary key default gen_random_uuid(),
//   trip_id uuid not null references trips(id) on delete cascade,
//   user_id uuid not null references auth.users(id) on delete cascade,
//   role trip_member_role not null default 'trip_traveler',
//   joined_at timestamptz not null default now(),
//   left_at timestamptz,
//   unique (trip_id, user_id)
// );

// -- ==========================
// -- TRIP JOIN CODES
// -- ==========================

// create table trip_join_codes (
//   id uuid primary key default gen_random_uuid(),
//   trip_id uuid not null references trips(id) on delete cascade,
//   code text not null,
//   is_active boolean not null default true,
//   expires_at timestamptz,
//   join_limit integer,
//   uses_count integer not null default 0,
//   created_at timestamptz not null default now(),
//   unique (code)
// );

// -- ==========================
// -- ITINERARY
// -- ==========================

// create table itinerary_items (
//   id uuid primary key default gen_random_uuid(),
//   trip_id uuid not null references trips(id) on delete cascade,
//   day_date date,
//   title text not null,
//   description text,
//   link text,
//   location text,
//   starts_at timestamptz,
//   ends_at timestamptz,
//   sort_order integer,
//   created_by uuid references auth.users(id),
//   created_at timestamptz not null default now(),
//   updated_at timestamptz not null default now()
// );

// -- ==========================
// -- ANNOUNCEMENTS
// -- ==========================

// create table announcements (
//   id uuid primary key default gen_random_uuid(),
//   trip_id uuid not null references trips(id) on delete cascade,
//   title text not null,
//   body text not null,
//   link_url text,
//   is_high_priority boolean not null default false,
//   scheduled_for timestamptz,
//   sent_at timestamptz,
//   created_by uuid references auth.users(id),
//   created_at timestamptz not null default now()
// );

// ==========================
// ENUMS
// ==========================

export type GroupRole =
  | 'group_super_admin'
  | 'group_admin'
  | 'group_member';

export type TripMemberRole =
  | 'trip_leader'
  | 'trip_traveler';

export type TripVisibility =
  | 'draft'
  | 'published'
  | 'active';

export type TripStatus =
  | 'draft'
  | 'active'
  | 'completed';

// ==========================
// PROFILE
// ==========================

export interface ProfileRow {
  user_id: string;

  display_name: string | null;
  country: string | null;
  city: string | null;

  gender: string | null;
  date_of_birth: string | null;         // date
  passport_number: string | null;
  passport_expiry: string | null;       // date
  blood_type: string | null;
  medical_notes: string | null;
  dietary_restrictions: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;

  passport_visible: boolean;
  medical_visible: boolean;
  emergency_visible: boolean;

  updated_at: string;
}

// ==========================
// GROUPS
// ==========================

export interface GroupRow {
  id: string;
  name: string;
  logo_url: string | null;
  whatsapp_link: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ==========================
// GROUP MEMBERSHIPS
// ==========================

export interface GroupMembershipRow {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
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
  base_city: string | null;
  visibility: TripVisibility;
  status: TripStatus;
  group_size: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================
// TRIP MEMBERSHIPS
// ==========================

export interface TripMembershipRow {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripMemberRole;
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
// ITINERARY
// ==========================

export interface ItineraryItemRow {
  id: string;
  trip_id: string;
  day_date: string | null;
  title: string;
  description: string | null;
  link: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number | null;
  created_by: string | null;
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
