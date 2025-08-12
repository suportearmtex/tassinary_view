import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseSchema = "tassinary"; // Schema fixo conforme solicitado

export const supabase = createClient(supabaseUrl, supabaseKey,{
    db: {
        schema: supabaseSchema
    }
});
