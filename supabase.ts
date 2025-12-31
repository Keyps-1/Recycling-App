import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qgldvgprzcelhdbukqwl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbGR2Z3ByemNlbGhkYnVrcXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzM2OTYsImV4cCI6MjA4MDI0OTY5Nn0.zwyCzc-Q7_jbpRXBIIRxmaeoj5N9b-HMIQ4BL1EtM74';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
