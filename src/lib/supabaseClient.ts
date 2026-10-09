import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from './envConfig';

export const supabase = createClient(ENV_CONFIG.SUPABASE_URL, ENV_CONFIG.SUPABASE_ANON_KEY);
