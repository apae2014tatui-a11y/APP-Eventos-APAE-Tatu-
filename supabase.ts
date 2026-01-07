
const SUPABASE_URL = "https://ognzsxtpklhrbnftnzsb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VmgaOSPtnjcCVILfNAtu-Q_8FKfcdaM";

declare var supabase: any;

export const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
