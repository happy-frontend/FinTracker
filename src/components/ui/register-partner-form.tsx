"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterPartnerForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        profitSharePercentage: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from("partners").insert([
            {
                name: formData.name,
                profit_share_percentage: parseFloat(formData.profitSharePercentage) || 0,
            },
        ]);

        setLoading(false);

        if (error) {
            toast.error("Error registering partner: " + error.message);
        } else {
            setFormData({
                name: "",
                profitSharePercentage: "",
            });
            if (onSuccess) onSuccess();
        }
    };

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-2 px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <User className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Partner Identity
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClasses}
                    />
                </div>

                {/* Profit Share */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <PieChart className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Equity Allocation (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            required
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0.0"
                            value={formData.profitSharePercentage}
                            onChange={(e) => setFormData({ ...formData, profitSharePercentage: e.target.value })}
                            className={cn(inputClasses, "pr-12 font-display font-bold")}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-bold">%</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg shadow-primary/20"
                >
                    {loading ? "Registering..." : "Onboard Partner"}
                </button>
            </div>
        </form>
    );
}
