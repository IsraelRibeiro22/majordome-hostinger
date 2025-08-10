import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://culjtilnsjwmdusvldue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bGp0aWxuc2p3bWR1c3ZsZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Nzk2MzcsImV4cCI6MjA2OTU1NTYzN30.B0Ps07DmHJ_vbuzj2X3-hOJw0_vMocGHl7D8nCyElgc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);