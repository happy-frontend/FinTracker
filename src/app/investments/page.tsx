"use client";

import { InvestmentForm } from "@/components/ui/investment-form";
import { toast } from "sonner";
import { Briefcase, ShieldCheck } from "lucide-react";

export default function InvestmentsPage() {
    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight flex items-center gap-4">
                        Capital Assets
                        <Briefcase className="w-8 h-8 text-primary/20" />
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        A secure registry of partner capital and institutional investments, ensuring long-term financial stability.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="max-w-2xl">
                <div className="surface-paper overflow-hidden">
                    <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Secure Capital Entry
                        </h2>
                        <span className="text-[10px] font-bold text-on-surface-variant/40">Equity Audit</span>
                    </div>
                    <div className="p-8 md:p-12">
                        <p className="text-sm text-on-surface-variant/60 font-medium mb-8 leading-relaxed">
                            Document additional capital injections for existing partners. All entries are cryptographically logged for the digital ledger.
                        </p>
                        <InvestmentForm onSuccess={() => toast.success("Asset allocation systematically logged")} />
                    </div>
                </div>
            </div>

            {/* Aesthetic Footer Note */}
            <div className="pt-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/20 text-center">
                    Institutional Grade Asset Management
                </p>
            </div>
        </div>
    );
}
