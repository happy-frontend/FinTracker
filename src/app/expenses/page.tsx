"use client";

import { useState } from "react";
import { ExpensesList } from "@/components/ui/expenses-list";
import { DateFilter, DateRange } from "@/components/ui/date-filter";
import { TrendingDown, CreditCard } from "lucide-react";

export default function ExpensesPage() {
    const [refreshList] = useState(0);
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        label: "All Time",
        startDate: null,
        endDate: null
    });

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight flex items-center gap-4">
                        Expense Accounts
                        <TrendingDown className="w-8 h-8 text-primary/20" />
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        A detailed catalog of operational outflows, including labour, logistics, and resource management.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <DateFilter selectedRange={selectedRange} onChange={setSelectedRange} />
                </div>
            </div>

            {/* List Container */}
            <div className="grid gap-8">
                <div className="surface-paper overflow-hidden flex flex-col h-full lg:min-h-[calc(100vh-20rem)]">
                    <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Verified Vouchers & Outflows
                        </h2>
                        <span className="text-[10px] font-bold text-on-surface-variant/40">Resource Ledger</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <ExpensesList refreshTrigger={refreshList} dateRange={selectedRange} />
                    </div>
                </div>
            </div>

            {/* Aesthetic Footer Note */}
            <div className="pt-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/20 italic">
                    The Digital Curator &bull; Operational Integrity
                </p>
            </div>
        </div>
    );
}
