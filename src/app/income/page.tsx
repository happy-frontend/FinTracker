"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IncomeList } from "@/components/ui/income-list";
import { DateFilter, DateRange } from "@/components/ui/date-filter";
import { FileText, Calendar, Hash, IndianRupee, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function IncomePage() {
    const [refreshList, setRefreshList] = useState(0);
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        label: "All Time",
        startDate: null,
        endDate: null
    });
    const [metrics, setMetrics] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        pendingPayments: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchIncomeMetrics() {
            setLoading(true);

            let query = supabase.from("income").select("booking_amount, amount_received, date");
            
            if (selectedRange.startDate && selectedRange.endDate) {
                query = query.gte("date", format(selectedRange.startDate, "yyyy-MM-dd")).lte("date", format(selectedRange.endDate, "yyyy-MM-dd"));
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching metrics:", error);
            } else if (data) {
                let revenue = 0;
                let pending = 0;
                data.forEach(item => {
                    revenue += (Number(item.booking_amount) || 0);
                    pending += (Number(item.booking_amount) || 0) - (Number(item.amount_received) || 0);
                });

                setMetrics({
                    totalBookings: data.length,
                    totalRevenue: revenue,
                    pendingPayments: pending,
                });
            }

            setLoading(false);
        }

        fetchIncomeMetrics();
    }, [selectedRange, refreshList]);

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                        Income
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        All income from bookings and events.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <DateFilter selectedRange={selectedRange} onChange={setSelectedRange} />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Timeline</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Time Period</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {selectedRange.label}
                    </p>
                    {selectedRange.startDate && selectedRange.endDate && (
                        <p className="mt-1 text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-tighter">
                            {format(selectedRange.startDate, 'MMM d')} — {format(selectedRange.endDate, 'MMM d, yyyy')}
                        </p>
                    )}
                </div>

                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                            <Hash className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Bookings</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Total Bookings</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {loading ? "..." : metrics.totalBookings}
                    </p>
                </div>

                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300 border-b-4 border-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Total Income</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {loading ? "..." : `₹${metrics.totalRevenue.toLocaleString()}`}
                    </p>
                </div>

                <div className={cn(
                    "surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300 border-b-4",
                    metrics.pendingPayments > 0 ? "border-error/20" : "border-success/20"
                )}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                            "p-2 rounded-lg",
                            metrics.pendingPayments > 0 ? "bg-error-container/30 text-error" : "bg-success-container/30 text-success"
                        )}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Payments</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Pending Payments</p>
                    <p className={cn(
                        "mt-2 text-3xl font-display font-bold",
                        metrics.pendingPayments > 0 ? "text-error" : "text-success"
                    )}>
                        {loading ? "..." : `₹${metrics.pendingPayments.toLocaleString()}`}
                    </p>
                </div>
            </div>

            {/* List Container */}
            <div className="grid gap-8">
                <div className="surface-paper overflow-hidden flex flex-col h-full lg:min-h-[calc(100vh-32rem)]">
                    <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
                        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Booking Records
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                        <IncomeList refreshTrigger={refreshList} dateRange={selectedRange} onStatusChange={() => setRefreshList(prev => prev + 1)} />
                    </div>
                </div>
            </div>

            {/* Aesthetic Footer Note */}
            <div className="pt-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/20 italic">
                    The Digital Curator &bull; Financial Excellence
                </p>
            </div>
        </div>
    );
}
