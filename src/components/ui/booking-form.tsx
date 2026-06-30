"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Calendar, User, MapPin, BadgeIndianRupee, CreditCard, Activity } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ExpenseEntry = {
    id: string;
    category: string;
    description: string;
    amount: string;
};

export function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split("T")[0],
        caterer: "",
        palace: "",
        noOfWaiters: "",
        labourCost: "",
        transport: "",
        bookingAmount: "",
        amountReceived: "",
        paymentStatus: "Pending",
    });

    const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);

    const addExpense = () => {
        setExpenses([
            ...expenses,
            { id: Math.random().toString(), category: "Labour", description: "", amount: "" }
        ]);
    };

    const removeExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const updateExpense = (id: string, field: keyof ExpenseEntry, value: string) => {
        setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Insert Income record
            const { error: incomeError } = await supabase.from("income").insert([{
                date: formData.date,
                caterer: formData.caterer,
                palace: formData.palace,
                no_of_waiters: parseInt(formData.noOfWaiters) || 0,
                booking_amount: parseFloat(formData.bookingAmount) || 0,
                amount_received: parseFloat(formData.amountReceived) || 0,
                payment_status: formData.paymentStatus,
            }]);

            if (incomeError) throw incomeError;

            // 2. Insert Consolidated Expenses (Single Row)
            let totalLabour = parseFloat(formData.labourCost) || 0;
            let totalTransport = parseFloat(formData.transport) || 0;
            const descriptions: string[] = [];

            if (totalLabour > 0 && formData.noOfWaiters) {
                descriptions.push(`Labour (${formData.noOfWaiters} Waiters)`);
            }

            expenses.forEach(exp => {
                const amt = parseFloat(exp.amount) || 0;
                if (exp.category === "Labour") totalLabour += amt;
                else if (exp.category === "Transport") totalTransport += amt;
                
                if (exp.description) descriptions.push(exp.description);
            });

            if (totalLabour > 0 || totalTransport > 0) {
                const { error: expenseError } = await supabase.from("expenses").insert([{
                    date: formData.date,
                    caterer: formData.caterer,
                    palace: formData.palace,
                    labour_cost: totalLabour,
                    transport_cost: totalTransport,
                    description: descriptions.join(" | ") || null
                }]);
                if (expenseError) throw expenseError;
            }

            // Reset form
            setFormData({
                date: new Date().toISOString().split("T")[0],
                caterer: "",
                palace: "",
                noOfWaiters: "",
                labourCost: "",
                transport: "",
                bookingAmount: "",
                amountReceived: "",
                paymentStatus: "Pending",
            });
            setExpenses([]);

            toast.success("Booking and associated expenses saved successfully!");
            if (onSuccess) onSuccess();

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast.error("Error saving data: " + message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-on-surface font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-2 px-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-12 max-w-5xl">
            {/* EVENT & INCOME DETAILS: Editorial Grid */}
            <div className="space-y-8">
                <div className="flex items-center gap-6">
                    <h3 className="text-xl font-display font-bold text-primary">Event & Income Details</h3>
                    <div className="h-[2px] flex-1 bg-outline-variant/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <Calendar className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Event Date
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

                    {/* Caterer */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <User className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Caterer Name
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Khullar Caters"
                            value={formData.caterer}
                            onChange={(e) => setFormData({ ...formData, caterer: e.target.value })}
                            className={inputClasses}
                        />
                    </div>

                    {/* Palace */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <MapPin className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Venue Location
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Royal Palace"
                            value={formData.palace}
                            onChange={(e) => setFormData({ ...formData, palace: e.target.value })}
                            className={inputClasses}
                        />
                    </div>

                    {/* No of Waiters */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <Activity className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Staff Count
                        </label>
                        <input
                            type="number"
                            min="0"
                            placeholder="e.g. 5"
                            value={formData.noOfWaiters}
                            onChange={(e) => setFormData({ ...formData, noOfWaiters: e.target.value })}
                            className={inputClasses}
                        />
                    </div>

                    {/* Labour Cost */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <BadgeIndianRupee className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Base Labour Cost
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.labourCost}
                                onChange={(e) => setFormData({ ...formData, labourCost: e.target.value })}
                                className={cn(inputClasses, "pl-10")}
                            />
                        </div>
                    </div>

                    {/* Transport Cost */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>
                            <CreditCard className="inline-block w-3.5 h-3.5 mr-2 mb-0.5 opacity-40" />
                            Transport Base
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.transport}
                                onChange={(e) => setFormData({ ...formData, transport: e.target.value })}
                                className={cn(inputClasses, "pl-10")}
                            />
                        </div>
                    </div>

                    {/* Booking Amount */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Total Invoice Value</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.bookingAmount}
                                onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
                                className={cn(inputClasses, "pl-10 border-primary/20 bg-primary/5 text-primary text-lg font-display font-bold")}
                            />
                        </div>
                    </div>

                    {/* Amount Received */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Advance Received</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amountReceived}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    let status = formData.paymentStatus;
                                    if (val && formData.bookingAmount) {
                                        const received = parseFloat(val);
                                        const total = parseFloat(formData.bookingAmount);
                                        if (received >= total) status = "Done";
                                        else if (received > 0) status = "Partial Payment";
                                        else status = "Pending";
                                    }
                                    setFormData({ ...formData, amountReceived: val, paymentStatus: status });
                                }}
                                className={cn(inputClasses, "pl-10 font-bold")}
                            />
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="space-y-1.5">
                        <label className={labelClasses}>Current Status</label>
                        <select
                            value={formData.paymentStatus}
                            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                            className={cn(inputClasses, "font-bold text-center appearance-none cursor-pointer", 
                                formData.paymentStatus === "Done" ? "bg-success-container text-success" : 
                                formData.paymentStatus === "Partial Payment" ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high"
                            )}
                        >
                            <option value="Done">DONE</option>
                            <option value="Partial Payment">PARTIAL</option>
                            <option value="Pending">PENDING</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* EXPENSES DETAILS: Tonal Sub-section */}
            <div className="bg-surface-container-low/40 p-8 rounded-2xl border border-outline-variant/10 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-display font-bold text-primary">Associated Expenses</h3>
                        <p className="text-[11px] text-on-surface-variant/60 font-medium">Capture granular operational costs (Optional)</p>
                    </div>
                    <button
                        type="button"
                        onClick={addExpense}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-xs font-bold uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    >
                        <Plus className="w-4 h-4" /> Add Line Item
                    </button>
                </div>
                
                {expenses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-outline-variant/20 rounded-xl">
                        <p className="text-sm text-on-surface-variant font-medium italic opacity-40">No additional expenses registered for this event.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {expenses.map((expense) => (
                            <div key={expense.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/5 shadow-sm group hover:border-primary/10 transition-all duration-300">
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>Category</label>
                                    <select
                                        value={expense.category}
                                        onChange={(e) => updateExpense(expense.id, "category", e.target.value)}
                                        className={cn(inputClasses, "py-2 text-sm")}
                                    >
                                        <option value="Labour">Labour</option>
                                        <option value="Transport">Transport</option>
                                    </select>
                                </div>
                                <div className="md:col-span-5">
                                    <label className={labelClasses}>Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Tempo fare"
                                        value={expense.description}
                                        onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                                        className={cn(inputClasses, "py-2 text-sm")}
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className={labelClasses}>Line Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        value={expense.amount}
                                        onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                                        className={cn(inputClasses, "py-2 text-sm font-bold")}
                                    />
                                </div>
                                <div className="md:col-span-1 flex justify-end pb-1.5 px-2">
                                    <button
                                        type="button"
                                        onClick={() => removeExpense(expense.id)}
                                        className="text-error/40 hover:text-error hover:bg-error-container/20 p-2.5 transition-all duration-300 rounded-lg"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submission Section */}
            <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-outline-variant/10">
                <div className="flex-1">
                    <p className="text-xs text-on-surface-variant/40 font-medium leading-relaxed max-w-sm">
                        By submitting this entry, you verify that all data points have been audited and reflect the accurate financial state of the event.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary min-w-[220px] shadow-lg shadow-primary/20 relative overflow-hidden group"
                    >
                        <span className={cn("transition-all duration-300", loading ? "opacity-0 invisible" : "opacity-100 visible")}>
                            Verify & Save Ledger
                        </span>
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-5 w-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
