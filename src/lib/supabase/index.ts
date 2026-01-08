// Client-side Supabase client
export { createClient as createBrowserClient } from "./client";

// Server-side Supabase client
export { createClient as createServerClient } from "./server";

// Auth utilities (server-side)
export { getUser, requireUser, getUserProfile, signOut } from "./auth";
