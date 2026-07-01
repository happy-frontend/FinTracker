"use client";

import { useState } from "react";
import { RegisterPartnerForm } from "@/components/ui/register-partner-form";
import { PartnerList } from "@/components/ui/partner-list";
import { UserPlus, ClipboardList } from "lucide-react";

export default function PartnersPage() {
    const [refreshList, setRefreshList] = useState(0);

    const handleInvestmentAdded = () => {
        setRefreshList((prev) => prev + 1);
    };

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                        Partners
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        Manage business partners and their capital share.
                    </p>
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-5">
                {/* Registration Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="surface-paper overflow-hidden">
                        <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                            <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Add Partner
                            </h2>
                        </div>
                        <div className="p-8">
                            <RegisterPartnerForm onSuccess={handleInvestmentAdded} />
                        </div>
                    </div>
                </div>

                {/* Overview Section */}
                <div className="lg:col-span-3 surface-paper overflow-hidden flex flex-col h-full lg:min-h-[calc(100vh-20rem)]">
                    <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Partner Summary
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <PartnerList refreshTrigger={refreshList} />
                    </div>
                </div>
            </div>

            {/* Aesthetic Footer Note */}
            <div className="pt-8 text-center text-on-surface-variant/20 italic">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em]">
                    Institutional Partnership Management
                </p>
            </div>
        </div>
    );
}
