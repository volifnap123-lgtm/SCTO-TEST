// Supabase Client Initialization
const SUPABASE_URL = 'https://noskliwvsiejokzmczfp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VO6LwV9CJe-45tDjFgXGug_TzYoQ-6v';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabaseClient = supabase;
console.log('Supabase клиент инициализирован');