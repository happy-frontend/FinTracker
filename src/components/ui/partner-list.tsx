"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { User, BadgeIndianRupee, Percent } from "lucide-react";

type PartnerSummary = {
    id: string;
    name: string;
    total_investment: number;
    profit_share_percentage: number;
};

export function PartnerList({ refreshTrigger }: { refreshTrigger: number }) {
    const [partners, setPartners] = useState<PartnerSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPartners() {
            setLoading(true);

            // Fetch all partners
            const { data: pData, error: pError } = await supabase.from("partners").select("*");

            // Fetch all investments
            const { data: iData, error: iError } = await supabase.from("investments").select("*");

            if (pError || iError) {
                console.error("Error loading partner data:", pError || iError);
            } else if (pData && iData) {
                // Aggregate investments per partner
                const summaries: PartnerSummary[] = pData.map(p => {
                    const partnerInvestments = iData.filter(i => i.partner_id === p.id);
                    const total = partnerInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
                    return {
                        id: p.id,
                        name: p.name,
                        total_investment: total,
                        profit_share_percentage: Number(p.profit_share_percentage) || 0
                    };
                });

                // Sort by investment size, largest first
                summaries.sort((a, b) => b.total_investment - a.total_investment);
                setPartners(summaries);
            }

            setLoading(false);
        }
        loadPartners();
    }, [refreshTrigger]);

    if (loading && partners.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 animate-pulse font-display italic">Auditing equity distribution...</div>;
    }

    if (partners.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 italic font-medium">No stakeholders registered in the system.</div>;
    }

    // Calculate total business investment
    const totalBusinessInvestment = partners.reduce((sum, p) => sum + p.total_investment, 0);

    return (
        <div className="relative">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-lowest sticky top-0 z-10">
                    <tr className="border-b border-outline-variant/10">
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Legal Entity (Partner)</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Aggregated Capital</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Equity Allocation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                    {partners.map((partner) => {
                        return (
                            <tr key={partner.id} className="group hover:bg-surface-container-low/40 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-surface-container overflow-hidden flex items-center justify-center text-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shadow-sm border border-outline-variant/5">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-display font-bold text-primary">
                                                {partner.name}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-1">
                                                Verified Stakeholder
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-primary font-display group-hover:translate-x-[-4px] transition-transform duration-300">
                                    ₹{partner.total_investment.toLocaleString()}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold font-display uppercase tracking-[0.1em] transition-all duration-300",
                                        partner.name === "Shared Capital" 
                                            ? "bg-surface-low text-on-surface-variant/30" 
                                            : "bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-on-primary group-hover:shadow-lg group-hover:shadow-primary/20"
                                    )}>
                                        {partner.name === "Shared Capital" ? <BadgeIndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                                        {partner.name === "Shared Capital" ? "Capital Pool" : `${partner.profit_share_percentage.toFixed(1)}%`}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {totalBusinessInvestment > 0 && (
                    <tfoot className="bg-primary/5 font-display font-bold text-primary">
                        <tr>
                            <td className="px-8 py-5 text-[11px] uppercase tracking-[0.2em] opacity-40">Total Net Capital</td>
                            <td className="px-8 py-5 text-right text-lg">₹{totalBusinessInvestment.toLocaleString()}</td>
                            <td className="px-8 py-5 text-right text-sm uppercase tracking-widest opacity-60">100% Interest</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
