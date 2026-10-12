import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbxeixxbvtetixsfgpsz.supabase.co';
const SUPABASE_ANON_KEY = 'Sb_publishable_rAnVEY_h3JTey_8ezmpXqA_HLYIkWVW';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
