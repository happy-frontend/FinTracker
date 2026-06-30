"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IncomeList } from "@/components/ui/income-list";
import { ExpensesList } from "@/components/ui/expenses-list";
import { DateFilter, DateRange } from "@/components/ui/date-filter";
import { AnalyticsChart } from "@/components/ui/analytics-chart";
import { CatererSummary } from "@/components/ui/caterer-summary";
import { PartnerSummary } from "@/components/ui/partner-summary";
import { format } from "date-fns";
import { TrendingUp, CreditCard, PieChart, Clock } from "lucide-react";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingReceivables: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<DateRange>({
        label: "All Time",
        startDate: null,
        endDate: null
    });

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);

            // Fetch Income
            let incomeQuery = supabase.from("income").select("booking_amount, amount_received, date");
            if (selectedRange.startDate && selectedRange.endDate) {
                incomeQuery = incomeQuery.gte("date", format(selectedRange.startDate, "yyyy-MM-dd")).lte("date", format(selectedRange.endDate, "yyyy-MM-dd"));
            }

            const { data: incomeData } = await incomeQuery;
            let revenue = 0;
            let pending = 0;

            if (incomeData) {
                incomeData.forEach(inc => {
                    revenue += Number(inc.booking_amount);
                    pending += (Number(inc.booking_amount) - Number(inc.amount_received));
                });
            }

            // Fetch Expenses
            let expenseQuery = supabase.from("expenses").select("labour_cost, transport_cost, date");
            if (selectedRange.startDate && selectedRange.endDate) {
                expenseQuery = expenseQuery.gte("date", format(selectedRange.startDate, "yyyy-MM-dd")).lte("date", format(selectedRange.endDate, "yyyy-MM-dd"));
            }

            const { data: expenseData } = await expenseQuery;
            let expenses = 0;

            if (expenseData) {
                expenseData.forEach((exp: { labour_cost: number | null; transport_cost: number | null }) => {
                    expenses += (Number(exp.labour_cost) || 0) + (Number(exp.transport_cost) || 0);
                });
            }

            setMetrics({
                totalRevenue: revenue,
                totalExpenses: expenses,
                netProfit: revenue - expenses,
                pendingReceivables: pending,
            });

            setLoading(false);
        }

        fetchDashboardData();
    }, [selectedRange]);

    return (
        <div className="space-y-12">
            {/* Header Section: Intentional Asymmetry */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        Your business at a glance — income, expenses, and profit.
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <DateFilter selectedRange={selectedRange} onChange={setSelectedRange} />
                </div>
            </div>

            {/* Metrics Grid: Tonal Layering */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Revenue</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Total Income</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {loading ? "..." : `₹${metrics.totalRevenue.toLocaleString()}`}
                    </p>
                </div>

                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">Outflow</span>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Total Expenses</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {loading ? "..." : `₹${metrics.totalExpenses.toLocaleString()}`}
                    </p>
                </div>

                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300 border-b-4 border-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <PieChart className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Net Profit</p>
                    <p className="mt-2 text-3xl font-display font-bold text-primary">
                        {loading ? "..." : `₹${metrics.netProfit.toLocaleString()}`}
                    </p>
                </div>

                <div className="surface-paper p-8 group hover:translate-y-[-2px] transition-all duration-300 border-b-4 border-error/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-error-container/30 rounded-lg text-error">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant">Pending Payments</p>
                    <p className="mt-2 text-3xl font-display font-bold text-error">
                        {loading ? "..." : `₹${metrics.pendingReceivables.toLocaleString()}`}
                    </p>
                </div>
            </div>

            {/* Charts & Analytics Section */}
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 surface-paper p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-primary">Income vs Expenses</h2>
                        <div className="h-0.5 flex-1 mx-8 bg-outline-variant/10"></div>
                    </div>
                    <div className="h-[400px]">
                        <AnalyticsChart dateRange={selectedRange} />
                    </div>
                </div>

                <div className="surface-paper p-8">
                    <h2 className="text-2xl font-display font-bold text-primary mb-8 underline decoration-primary/10 underline-offset-8">Caterer Activity</h2>
                    <div className="space-y-8">
                        <div className="bg-surface-container-low/50 p-6 rounded-xl">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-4">Caterer Distribution</h3>
                            <CatererSummary dateRange={selectedRange} />
                        </div>
                        <div className="bg-surface-container-low/50 p-6 rounded-xl">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/50 mb-4">Partner Capital</h3>
                            <PartnerSummary dateRange={selectedRange} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Ledger Section */}
            <div className="grid gap-8 xl:grid-cols-2">
                <div className="surface-paper p-8 flex flex-col min-h-[600px] overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-primary">Income</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <IncomeList refreshTrigger={0} dateRange={selectedRange} />
                    </div>
                </div>

                <div className="surface-paper p-8 flex flex-col min-h-[600px] overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-primary">Expenses</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <ExpensesList refreshTrigger={0} dateRange={selectedRange} />
                    </div>
                </div>
            </div>
        </div>
    );
}
