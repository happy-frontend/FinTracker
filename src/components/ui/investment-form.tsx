"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Calendar, User, BadgeIndianRupee, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type Partner = { id: string; name: string };

export function InvestmentForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        partnerId: "",
        amount: "",
        notes: "",
    });

    // Load partners for the dropdown
    useEffect(() => {
        async function fetchPartners() {
            const { data } = await supabase.from("partners").select("id, name").order("name");
            if (data) {
                setPartners(data);
                if (data.length > 0) setFormData(f => ({ ...f, partnerId: data[0].id }));
            }
        }
        fetchPartners();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.partnerId) return toast.error("Please select or add a partner first.");
        setLoading(true);

        const { error } = await supabase.from("investments").insert([
            {
                date: formData.date,
                partner_id: formData.partnerId,
                amount: parseFloat(formData.amount) || 0,
                notes: formData.notes,
            },
        ]);

        setLoading(false);

        if (error) {
            toast.error("Error saving investment: " + error.message);
        } else {
            setFormData(f => ({
                ...f,
                date: new Date().toISOString().split("T")[0],
                amount: "",
                notes: "",
            }));
            if (onSuccess) onSuccess();
        }
    };

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-2 px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <Calendar className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Date of Transfer
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                        className={inputClasses}
                    />
                </div>

                {/* Partner */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <User className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Partner Entity
                    </label>
                    <select
                        required
                        value={formData.partnerId}
                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                        className={cn(inputClasses, "cursor-pointer appearance-none")}
                    >
                        {partners.length === 0 ? (
                            <option value="">No partners found</option>
                        ) : (
                            partners.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))
                        )}
                    </select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <BadgeIndianRupee className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Capital Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className={cn(inputClasses, "pl-10 font-display font-bold text-lg")}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5 flex flex-col">
                    <label className={labelClasses}>
                        <FileText className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                        Description
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Initial capital injection"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className={inputClasses}
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !formData.partnerId}
                    className="btn-primary min-w-[200px] shadow-lg shadow-primary/20"
                >
                    {loading ? "Authorizing Capital..." : "Finalize Investment"}
                </button>
            </div>
        </form>
    );
}
