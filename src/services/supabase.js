import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dvtnvvlbzgngkiljwyrl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dG52dmxiemduZ2tpbGp3eXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTY5NjUsImV4cCI6MjA5NTQ5Mjk2NX0.c9nKAV3cbXllp6ZgSj6US9Q9ecLoqH_RupDlrLuN1ug";

export const supabase = createClient(supabaseUrl, supabaseKey);