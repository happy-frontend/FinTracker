const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addPartner() {
  const { data, error } = await supabase.from('partners').insert([
    { name: 'Shared Capital', profit_share_percentage: 0 }
  ]);
  if (error) {
    console.error('Error adding Shared Capital:', error);
  } else {
    console.log('Successfully added Shared Capital Partner!', data);
  }
}

addPartner();
