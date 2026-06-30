"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DateRange } from "./date-filter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type CatererSummaryData = {
    name: string;
    totalBookings: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
};

export function CatererSummary({ dateRange }: { dateRange: DateRange }) {
    const [data, setData] = useState<CatererSummaryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSummary() {
            setLoading(true);

            let query = supabase.from("income").select("caterer, booking_amount, amount_received, date");

            if (dateRange.startDate && dateRange.endDate) {
                query = query.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
            }

            const { data: incomeData, error } = await query;

            if (error) {
                console.error("Error loading caterer summary:", error);
                setLoading(false);
                return;
            }

            const map = new Map<string, CatererSummaryData>();

            if (incomeData) {
                incomeData.forEach((inc) => {
                    const name = inc.caterer || "Unknown";
                    if (!map.has(name)) {
                        map.set(name, {
                            name,
                            totalBookings: 0,
                            totalAmount: 0,
                            totalPaid: 0,
                            totalPending: 0
                        });
                    }

                    const stat = map.get(name)!;
                    stat.totalBookings += 1;
                    stat.totalAmount += Number(inc.booking_amount) || 0;
                    stat.totalPaid += Number(inc.amount_received) || 0;
                    stat.totalPending += (Number(inc.booking_amount) || 0) - (Number(inc.amount_received) || 0);
                });
            }

            // Sort by total amount descending
            const sorted = Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
            setData(sorted);
            setLoading(false);
        }

        fetchSummary();
    }, [dateRange]);

    if (loading) {
        return <div className="p-8 text-center text-on-surface-variant/30 font-display italic animate-pulse">Auditing merchant performance...</div>;
    }

    if (data.length === 0) {
        return <div className="p-8 text-center text-on-surface-variant/40 italic font-medium">No merchant transaction history found.</div>;
    }

    // Calculate totals for the footer
    const totals = data.reduce(
        (acc, curr) => {
            acc.bookings += curr.totalBookings;
            acc.amount += curr.totalAmount;
            acc.paid += curr.totalPaid;
            acc.pending += curr.totalPending;
            return acc;
        },
        { bookings: 0, amount: 0, paid: 0, pending: 0 }
    );

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-container-low/20">
                    <tr className="border-b border-outline-variant/10">
                        <th className="px-6 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Caterer</th>
                        <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-center">Events</th>
                        <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Value</th>
                        <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Settled</th>
                        <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                    {data.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-surface-container-low transition-all duration-300">
                            <td className="px-6 py-4 font-display font-bold text-primary text-sm">{row.name}</td>
                            <td className="px-4 py-4 text-center font-medium text-on-surface-variant">{row.totalBookings}</td>
                            <td className="px-4 py-4 text-right font-display font-bold text-primary">₹{row.totalAmount.toLocaleString()}</td>
                            <td className="px-4 py-4 text-right font-display font-bold text-success/80">₹{row.totalPaid.toLocaleString()}</td>
                            <td className={cn("px-4 py-4 text-right font-display font-bold", row.totalPending > 0 ? "text-error/60" : "text-on-surface-variant/30")}>
                                {row.totalPending > 0 ? `₹${row.totalPending.toLocaleString()}` : "Settled"}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-primary/5 font-display font-bold text-primary">
                    <tr>
                        <td className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40">Net Position</td>
                        <td className="px-4 py-4 text-center">{totals.bookings}</td>
                        <td className="px-4 py-4 text-right">₹{totals.amount.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right">₹{totals.paid.toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-error/80">₹{totals.pending.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
