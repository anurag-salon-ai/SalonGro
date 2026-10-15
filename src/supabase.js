import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbxeixxbvtetixsfgpsz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZieGVpeHhidnRldGl4c2ZncHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTM3OTcsImV4cCI6MjEwNjc4OTc5N30.tJ2HK_4eEg-dzGUOJ6Dox0mEGijtMPCA10CL772C-TI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
