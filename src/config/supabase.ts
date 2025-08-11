import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseSchema = import.meta.env.VITE_SCHEMA || "";

export const SupabaseClient = createClient(supabaseUrl, supabaseKey,{
    db: {
        schema: supabaseSchema
    }
});
