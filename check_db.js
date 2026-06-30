const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: income, error: err1 } = await supabase.from('income').select('*');
    if (err1) console.error("Income Error:", err1.message);
    else console.log("\nINCOME RECORDS:", income);

    const { data: expenses, error: err2 } = await supabase.from('expenses').select('*');
    if (err2) console.error("Expenses Error:", err2.message);
    else console.log("\nEXPENSES RECORDS:", expenses);
}

check();
