import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://aooyzdtujeaytavlykpj.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb3l6ZHR1amVheXRhdmx5a3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwMjU0OTIsImV4cCI6MjA1MzYwMTQ5Mn0.9xpoBDwR96mmCk_r2QDFXiRJRQg5kdmAWBk3oZTAJOc";
const supabaseSchema = "tassinary"; // Schema fixo conforme solicitado

export const supabase = createClient(supabaseUrl, supabaseKey,{
    db: {
        schema: supabaseSchema
    }
});
