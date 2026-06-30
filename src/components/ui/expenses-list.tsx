"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "@/components/ui/date-filter";
import { Edit2, Trash2, X, CreditCard } from "lucide-react";
import { toast } from "sonner";

type ExpenseRecord = {
    id: string;
    date: string;
    caterer?: string | null;
    palace?: string | null;
    labour_cost: number;
    transport_cost: number;
    description?: string | null;
};

export function ExpensesList({ refreshTrigger, dateRange }: { refreshTrigger: number, dateRange?: DateRange }) {
    const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

    // Form state for editing
    const [editForm, setEditForm] = useState({
        date: "",
        caterer: "",
        palace: "",
        labour_cost: "",
        transport_cost: "",
        description: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    const loadExpenses = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from("expenses")
            .select("*")
            .order("date", { ascending: false });

        if (dateRange?.startDate && dateRange?.endDate) {
            query = query.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error loading expenses:", error);
        } else {
            setExpenses(data || []);
        }
        setLoading(false);
    }, [dateRange]);

    useEffect(() => {
        loadExpenses();
    }, [refreshTrigger, loadExpenses]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
            return;
        }

        try {
            const { error } = await supabase.from("expenses").delete().eq("id", id);
            if (error) throw error;
            // Optimistic update
            setExpenses(expenses.filter(exp => exp.id !== id));
            toast.success("Expense record purged systematically");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error("Error deleting record: " + message);
        }
    };

    const handleEditClick = (exp: ExpenseRecord) => {
        setEditingExpense(exp);
        setEditForm({
            date: exp.date,
            caterer: exp.caterer || "",
            palace: exp.palace || "",
            labour_cost: (exp.labour_cost || 0).toString(),
            transport_cost: (exp.transport_cost || 0).toString(),
            description: exp.description || ""
        });
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingExpense) return;
        setIsSaving(true);

        try {
            const payload = {
                date: editForm.date,
                caterer: editForm.caterer,
                palace: editForm.palace,
                labour_cost: parseFloat(editForm.labour_cost) || 0,
                transport_cost: parseFloat(editForm.transport_cost) || 0,
                description: editForm.description
            };

            const { error } = await supabase
                .from("expenses")
                .update(payload)
                .eq("id", editingExpense.id);

            if (error) throw error;

            // Optimistic update
            setExpenses(expenses.map(exp => exp.id === editingExpense.id ? { ...exp, ...payload } : exp));
            setEditingExpense(null);
            toast.success("Voucher updated");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error("Error updating record: " + message);
        } finally {
            setIsSaving(false);
        }
    };

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-2 text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-1.5 px-0.5";

    if (loading && expenses.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 animate-pulse font-display italic">Auditing operational outflows...</div>;
    }

    if (expenses.length === 0) {
        return <div className="p-12 text-center text-on-surface-variant/40 italic font-medium">No recorded expenses found for this period.</div>;
    }

    return (
        <div className="relative">
            <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-lowest sticky top-0 z-10">
                    <tr className="border-b border-outline-variant/10">
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Date</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Merchant & Venue</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Labour</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Transport</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Total Outflow</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40">Notes</th>
                        <th className="px-8 py-5 text-[11px] font-display font-bold uppercase tracking-[0.2em] text-primary/40 text-right">Audit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                    {expenses.map((exp) => {
                        const total = (exp.labour_cost || 0) + (exp.transport_cost || 0);
                        return (
                            <tr key={exp.id} className="group hover:bg-surface-container-low/40 transition-all duration-300">
                                <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-on-surface-variant">
                                    {format(new Date(exp.date), "dd MMM yyyy")}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-display font-bold text-primary group-hover:translate-x-1 transition-transform duration-300">
                                            {exp.caterer || "Unnamed Caterer"}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mt-1 flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-primary/20"></div>
                                            {exp.palace || "Unknown Palace"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-on-surface-variant/70 font-display">
                                    {exp.labour_cost > 0 ? `₹${exp.labour_cost.toLocaleString()}` : "-"}
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-on-surface-variant/70 font-display">
                                    {exp.transport_cost > 0 ? `₹${exp.transport_cost.toLocaleString()}` : "-"}
                                </td>
                                <td className="px-8 py-6 text-right text-sm font-bold text-primary font-display group-hover:scale-105 transition-transform duration-300">
                                    ₹{total.toLocaleString()}
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[11px] font-medium text-on-surface-variant/40 max-w-[200px] truncate block italic" title={exp.description || ""}>
                                        {exp.description || "No specific notes recorded"}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                        <button 
                                            onClick={() => handleEditClick(exp)}
                                            className="p-2 text-on-surface-variant/50 hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-lg"
                                            title="Edit Records"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(exp.id)}
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
            {editingExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12 overflow-y-auto custom-scrollbar">
                    <div className="fixed inset-0 bg-primary/10 backdrop-blur-md transition-opacity duration-500" onClick={() => setEditingExpense(null)} />
                    <div className="relative bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-[0_32px_64px_rgba(0,52,45,0.08)] w-full max-w-2xl overflow-hidden scale-in animate-in duration-300 slide-in-from-bottom-4">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/5 bg-primary/5">
                            <div>
                                <h3 className="text-xl font-display font-bold text-primary flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 opacity-40" />
                                    Operational Voucher Review
                                </h3>
                                <p className="text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest mt-1">Audit Log Amendment</p>
                            </div>
                            <button 
                                onClick={() => setEditingExpense(null)}
                                className="p-2 text-on-surface-variant/40 hover:text-primary hover:bg-primary/5 transition-all duration-300 rounded-xl"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className={labelClasses}>Voucher Date</label>
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
                                    <label className={labelClasses}>Labour Allocation (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={editForm.labour_cost}
                                        onChange={(e) => setEditForm({...editForm, labour_cost: e.target.value})}
                                        className={cn(inputClasses, "font-bold text-on-surface-variant/70")}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Logistics Allocation (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={editForm.transport_cost}
                                        onChange={(e) => setEditForm({...editForm, transport_cost: e.target.value})}
                                        className={cn(inputClasses, "font-bold text-on-surface-variant/70")}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClasses}>Voucher Description / Notes</label>
                                    <input
                                        type="text"
                                        value={editForm.description}
                                        placeholder="Systematic record of specific costs"
                                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-4 border-t border-outline-variant/10 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingExpense(null)}
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
