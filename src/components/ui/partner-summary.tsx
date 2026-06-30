"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DateRange } from "./date-filter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

type PartnerSummaryData = {
    name: string;
    investment: number;
    sharePercentage: number;
    profitShare: number;
};

export function PartnerSummary({ dateRange }: { dateRange: DateRange }) {
    const [data, setData] = useState<PartnerSummaryData[]>([]);
    const [netProfit, setNetProfit] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPartnerSummary() {
            setLoading(true);

            // Fetch Partners
            const { data: partners, error: partnersError } = await supabase.from("partners").select("*");

            // Fetch all investments so we can aggregate capital per partner.
            // Capital is cumulative and not bound by the dashboard date range.
            const investmentsQuery = supabase.from("investments").select("partner_id, amount");

            // Fetch Income & Expenses for profit calculation
            let incomeQuery = supabase.from("income").select("booking_amount, date");
            let expenseQuery = supabase.from("expenses").select("labour_cost, transport_cost, date");

            if (dateRange.startDate && dateRange.endDate) {
                incomeQuery = incomeQuery.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
                expenseQuery = expenseQuery.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
            }

            const [incomeRes, expenseRes, investmentsRes] = await Promise.all([incomeQuery, expenseQuery, investmentsQuery]);

            if (partnersError) {
                console.error("Error loading partners:", partnersError);
                setLoading(false);
                return;
            }

            if (investmentsRes.error) {
                console.error("Error loading investments:", investmentsRes.error);
            }

            // Aggregate investment amounts grouped by partner_id
            const investmentByPartner = new Map<string, number>();
            if (investmentsRes.data) {
                investmentsRes.data.forEach((inv) => {
                    const current = investmentByPartner.get(inv.partner_id) || 0;
                    investmentByPartner.set(inv.partner_id, current + (Number(inv.amount) || 0));
                });
            }

            let revenue = 0;
            let expenses = 0;

            if (incomeRes.data) {
                incomeRes.data.forEach((inc) => { revenue += Number(inc.booking_amount); });
            }
            if (expenseRes.data) {
                expenseRes.data.forEach((exp: { labour_cost: number | null; transport_cost: number | null }) => { expenses += (Number(exp.labour_cost) || 0) + (Number(exp.transport_cost) || 0); });
            }

            const calculatedNetProfit = revenue - expenses;
            setNetProfit(calculatedNetProfit);

            if (partners) {
                // Filter out "Shared Capital" so only real partners are displayed in the dashboard summary
                const realPartners = partners.filter(p => p.name !== "Shared Capital");
                const partnerList: PartnerSummaryData[] = realPartners.map(p => {
                    const share = Number(p.profit_share_percentage) || 0;
                    // Profit share can be negative if netProfit is negative
                    const profitShareAmount = (calculatedNetProfit * share) / 100;

                    return {
                        name: p.name,
                        investment: investmentByPartner.get(p.id) || 0,
                        sharePercentage: share,
                        profitShare: profitShareAmount
                    };
                });
                setData(partnerList);
            }

            setLoading(false);
        }

        fetchPartnerSummary();
    }, [dateRange]);

    if (loading) {
        return <div className="p-8 text-center text-on-surface-variant/30 font-display italic animate-pulse">Calculating equity splits...</div>;
    }

    if (data.length === 0) {
        return <div className="p-8 text-center text-on-surface-variant/40 italic font-medium">No partner data available.</div>;
    }

    // Calculate totals
    const totals = data.reduce(
        (acc, curr) => {
            acc.investment += curr.investment;
            acc.share += curr.sharePercentage;
            acc.profit += curr.profitShare;
            return acc;
        },
        { investment: 0, share: 0, profit: 0 }
    );

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between bg-primary/5 px-6 py-4 rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Users className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 font-display">Calculated Net Position</span>
                </div>
                <div className={cn("text-lg font-display font-bold flex items-center gap-2", netProfit >= 0 ? "text-primary" : "text-error")}>
                    {netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    ₹{netProfit.toLocaleString()}
                </div>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-surface-container-low/20">
                        <tr className="border-b border-outline-variant/10">
                            <th className="px-6 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Partner Entity</th>
                            <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Capital</th>
                            <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-center">Split %</th>
                            <th className="px-4 py-4 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Equity Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                        {data.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-surface-container-low transition-all duration-300">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary border border-outline-variant/5 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                                            {row.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-display font-bold text-primary text-sm">{row.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right text-sm font-medium text-on-surface-variant/70">₹{row.investment.toLocaleString()}</td>
                                <td className="px-4 py-4 text-center font-display font-bold text-primary/60">{row.sharePercentage}%</td>
                                <td className={cn("px-4 py-4 text-right font-display font-bold text-sm", row.profitShare >= 0 ? "text-primary group-hover:translate-x-[-2px] transition-transform" : "text-error/80")}>
                                    {row.profitShare >= 0 ? `₹${row.profitShare.toLocaleString()}` : `-₹${Math.abs(row.profitShare).toLocaleString()}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-primary/5 font-display font-bold text-primary">
                        <tr>
                            <td className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40">Aggregate Distribution</td>
                            <td className="px-4 py-4 text-right">₹{totals.investment.toLocaleString()}</td>
                            <td className="px-4 py-4 text-center">{totals.share}%</td>
                            <td className={cn("px-4 py-4 text-right text-lg", totals.profit >= 0 ? "text-primary" : "text-error")}>
                                {totals.profit >= 0 ? `₹${totals.profit.toLocaleString()}` : `-₹${Math.abs(totals.profit).toLocaleString()}`}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
