"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "@/components/ui/date-filter";
import { Edit2, Trash2, X, Receipt, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

type IncomeRecord = {
    id: string;
    date: string;
    caterer?: string;
    palace?: string;
    caterer_place?: string;
    booking_amount: number;
    amount_received: number;
    payment_status: string;
};

export function IncomeList({ refreshTrigger, dateRange, onStatusChange }: { refreshTrigger: number, dateRange?: DateRange, onStatusChange?: () => void }) {
    const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingIncome, setEditingIncome] = useState<IncomeRecord | null>(null);

    // Form state for editing
    const [editForm, setEditForm] = useState({
        date: "",
        caterer: "",
        palace: "",
        booking_amount: "",
        amount_received: "",
        payment_status: "Pending"
    });
    const [isSaving, setIsSaving] = useState(false);

    const loadIncomes = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from("income")
            .select("*")
            .order("date", { ascending: false });

        if (dateRange?.startDate && dateRange?.endDate) {
            query = query.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error loading incomes:", error);
        } else {
            setIncomes(data || []);
        }
        setLoading(false);
    }, [dateRange]);

    useEffect(() => {
        loadIncomes();
    }, [refreshTrigger, loadIncomes]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
            return;
        }
        
        try {
            const { error } = await supabase.from("income").delete().eq("id", id);
            if (error) throw error;
            // Optimistic update
            setIncomes(incomes.filter(inc => inc.id !== id));
            toast.success("Booking deleted systematically");
            if (onStatusChange) onStatusChange();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error("Error deleting record: " + message);
        }
    };

    const handleEditClick = (inc: IncomeRecord) => {
        setEditingIncome(inc);
        setEditForm({
            date: inc.date,
            caterer: inc.caterer || "",
            palace: inc.palace || "",
            booking_amount: inc.booking_amount.toString(),
            amount_received: inc.amount_received.toString(),
            payment_status: inc.payment_status || "Pending"
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIncome) return;
        setIsSaving(true);

        try {
            const payload = {
                date: editForm.date,
                caterer: editForm.caterer,
                palace: editForm.palace,
                booking_amount: parseFloat(editForm.booking_amount) || 0,
                amount_received: parseFloat(editForm.amount_received) || 0,
                payment_status: editForm.payment_status
            };

            const { error } = await supabase
                .from("income")
                .update(payload)
                .eq("id", editingIncome.id);

            if (error) throw error;

            // Optimistic update
            setIncomes(incomes.map(inc => inc.id === editingIncome.id ? { ...inc, ...payload } : inc));
            setEditingIncome(null);
            toast.success("Audit log updated");
            if (onStatusChange) onStatusChange();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error("Error updating record: " + message);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-calculate status when amount received changes
    useEffect(() => {
        if (!editingIncome) return;
        const received = parseFloat(editForm.amount_received) || 0;
        const total = parseFloat(editForm.booking_amount) || 0;
        
        let newStatus = editForm.payment_status;
        if (total > 0) {
            if (received >= total) newStatus = "Done";
            else if (received > 0) newStatus = "Partial Payment";
            else newStatus = "Pending";
        }
        
        if (newStatus !== editForm.payment_status) {
            setEditForm(prev => ({ ...prev, payment_status: newStatus }));
        }
        // editForm.payment_status is intentionally omitted: this effect derives the
        // status from the amounts, and depending on it would override a user's manual
        // status selection.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editForm.amount_received, editForm.booking_amount, editingIncome]);

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-2 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-1.5 px-0.5";

    if (loading && incomes.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 animate-pulse font-display italic">Auditing financial records...</div>;
    }

    if (incomes.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 italic font-medium">No recorded transactions found for this period.</div>;
    }

    return (
        <div className="relative">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-lowest sticky top-0 z-10">
                    <tr className="border-b border-outline-variant/10">
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Date</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Merchant & Venue</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Invoice Vol.</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Settled</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Balance</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-center">Status</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Audit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                    {incomes.map((inc) => {
                        const pending = inc.booking_amount - inc.amount_received;
                        return (
                            <tr key={inc.id} className="group hover:bg-surface-container-low/40 transition-all duration-300">
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-on-surface-variant">
                                    {format(new Date(inc.date), "dd MMM yyyy")}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-display font-bold text-primary group-hover:translate-x-1 transition-transform duration-300">
                                            {inc.caterer || "Unnamed Caterer"}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-1 flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-primary/20"></div>
                                            {inc.palace || "Unknown Palace"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-primary font-display">
                                    ₹{inc.booking_amount.toLocaleString()}
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-success font-display">
                                    ₹{inc.amount_received.toLocaleString()}
                                </td>
                                <td className={cn("px-8 py-6 text-right text-sm font-bold font-display", pending > 0 ? "text-error/60" : "text-on-surface-variant/30")}>
                                    {pending > 0 ? `₹${pending.toLocaleString()}` : "Settled"}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] border transition-all duration-300",
                                            inc.payment_status === "Done" && "bg-success-container/30 text-success border-success/10",
                                            inc.payment_status === "Partial Payment" && "bg-secondary-container/30 text-on-secondary-container border-secondary/10",
                                            inc.payment_status === "Pending" && "bg-error-container/20 text-error/70 border-error/10"
                                        )}
                                    >
                                        {inc.payment_status === "Done" ? <CheckCircle2 className="w-3 h-3" /> : 
                                         inc.payment_status === "Partial Payment" ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {inc.payment_status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => handleEditClick(inc)}
                                            className="p-2 text-on-surface-variant/50 hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg"
                                            title="Edit Records"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(inc.id)}
                                            className="p-2 text-on-surface-variant/50 hover:text-error hover:bg-error-container/20 transition-all duration-300 rounded-lg"
                                            title="Purge Record"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* SYSTEMATIC EDIT MODAL */}
            {editingIncome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-y-auto custom-scrollbar">
                    <div className="fixed inset-0 bg-primary/10 backdrop-blur-md transition-opacity duration-500" onClick={() => setEditingIncome(null)} />
                    <div className="relative bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-[0_32px_64px_rgba(0,52,45,0.08)] w-full max-w-2xl overflow-hidden scale-in animate-in duration-300 slide-in-from-bottom-4">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/5 bg-primary/5">
                            <div>
                                <h3 className="text-xl font-display font-bold text-primary flex items-center gap-3">
                                    <Receipt className="w-5 h-5 opacity-40" />
                                    Account Reconciliation
                                </h3>
                                <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">Audit Log Amendment</p>
                            </div>
                            <button 
                                onClick={() => setEditingIncome(null)}
                                className="p-2 text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className={labelClasses}>Transaction Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                        onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Merchant Group (Caterer)</label>
                                    <input
                                        type="text"
                                        value={editForm.caterer}
                                        onChange={(e) => setEditForm({...editForm, caterer: e.target.value})}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Venue Identifier (Palace)</label>
                                    <input
                                        type="text"
                                        value={editForm.palace}
                                        onChange={(e) => setEditForm({...editForm, palace: e.target.value})}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Invoice Volume (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={editForm.booking_amount}
                                        onChange={(e) => setEditForm({...editForm, booking_amount: e.target.value})}
                                        className={cn(inputClasses, "font-bold text-primary")}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Volume Settled (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={editForm.amount_received}
                                        onChange={(e) => setEditForm({...editForm, amount_received: e.target.value})}
                                        className={cn(inputClasses, "font-bold text-success")}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClasses}>Classification</label>
                                    <select
                                        value={editForm.payment_status}
                                        onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                                        className={cn(inputClasses, "font-bold text-center", 
                                            editForm.payment_status === "Done" ? "bg-success-container/20 text-success" : 
                                            editForm.payment_status === "Partial Payment" ? "bg-secondary-container/20 text-on-secondary-container" : "bg-surface-container-high"
                                        )}
                                    >
                                        <option value="Done">DONE</option>
                                        <option value="Partial Payment">PARTIAL</option>
                                        <option value="Pending">PENDING</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant/10 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingIncome(null)}
                                    className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-primary min-w-[180px] shadow-lg shadow-primary/20"
                                >
                                    {isSaving ? "Finalizing..." : "Authorize Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
