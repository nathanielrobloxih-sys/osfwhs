import { createClient } from '@supabase/supabase-js'

// This site shares the same Supabase project as osfcspan - tables use a
// wh_ prefix so nothing collides with C-SPAN's tables.
const supabaseUrl = 'https://eynpooewvzcbhajgzlro.supabase.co'
const supabaseKey = 'sb_publishable_InblwSuEZICXdoO1el5abA_dyLA97u4'

export const supabase = createClient(supabaseUrl, supabaseKey)
