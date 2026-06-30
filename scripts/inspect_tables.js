const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCol(table, col) {
    const { error } = await supabase.from(table).select(col).limit(1);
    if (error) {
        return { col, exists: false, error: error.message };
    }
    return { col, exists: true };
}

async function inspect() {
    const incomeCols = [
        'id', 'date', 'caterer_place', 'category', 'booking_amount', 
        'amount_received', 'payment_status', 'created_at',
        'caterer', 'palace', 'no_of_waiters'
    ];
    console.log("--- INCOME COLUMNS ---");
    for (const col of incomeCols) {
        const res = await checkCol('income', col);
        console.log(`${col}: ${res.exists ? "EXISTS" : "MISSING (" + res.error + ")"}`);
    }

    const expenseCols = [
        'id', 'date', 'category', 'description', 'caterer_place', 'amount', 'created_at',
        'caterer', 'palace', 'labour_cost', 'transport_cost'
    ];
    console.log("\n--- EXPENSES COLUMNS ---");
    for (const col of expenseCols) {
        const res = await checkCol('expenses', col);
        console.log(`${col}: ${res.exists ? "EXISTS" : "MISSING (" + res.error + ")"}`);
    }

    const partnerCols = [
        'id', 'name', 'created_at', 'investment_amount', 'profit_share_percentage'
    ];
    console.log("\n--- PARTNERS COLUMNS ---");
    for (const col of partnerCols) {
        const res = await checkCol('partners', col);
        console.log(`${col}: ${res.exists ? "EXISTS" : "MISSING (" + res.error + ")"}`);
    }

    const investmentCols = [
        'id', 'partner_id', 'amount', 'date', 'notes', 'created_at'
    ];
    console.log("\n--- INVESTMENTS COLUMNS ---");
    for (const col of investmentCols) {
        const res = await checkCol('investments', col);
        console.log(`${col}: ${res.exists ? "EXISTS" : "MISSING (" + res.error + ")"}`);
    }
}

inspect();
