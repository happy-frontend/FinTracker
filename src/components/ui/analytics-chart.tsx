"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DateRange } from "./date-filter";
import { format, parseISO, startOfDay } from "date-fns";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

type ChartData = {
    date: string;
    income: number;
    expenses: number;
};

export function AnalyticsChart({ dateRange }: { dateRange: DateRange }) {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchChartData() {
            setLoading(true);

            let incomeQuery = supabase.from("income").select("booking_amount, date");
            let expenseQuery = supabase.from("expenses").select("labour_cost, transport_cost, date");

            if (dateRange.startDate && dateRange.endDate) {
                incomeQuery = incomeQuery.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
                expenseQuery = expenseQuery.gte("date", format(dateRange.startDate, "yyyy-MM-dd")).lte("date", format(dateRange.endDate, "yyyy-MM-dd"));
            }

            const [incomeRes, expenseRes] = await Promise.all([incomeQuery, expenseQuery]);

            const map = new Map<string, ChartData>();

            // Aggregate Income
            if (incomeRes.data) {
                incomeRes.data.forEach((inc) => {
                    const d = format(startOfDay(parseISO(inc.date)), "MMM dd");
                    if (!map.has(d)) map.set(d, { date: d, income: 0, expenses: 0 });
                    map.get(d)!.income += Number(inc.booking_amount);
                });
            }

            // Aggregate Expenses
            if (expenseRes.data) {
                expenseRes.data.forEach((exp: { date: string; labour_cost: number | null; transport_cost: number | null }) => {
                    const d = format(startOfDay(parseISO(exp.date)), "MMM dd");
                    if (!map.has(d)) map.set(d, { date: d, income: 0, expenses: 0 });
                    map.get(d)!.expenses += (Number(exp.labour_cost) || 0) + (Number(exp.transport_cost) || 0);
                });
            }

            // Convert to array and sort chronologically 
            const unsortedData = Array.from(map.values());
            const sortedData = unsortedData.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            });

            setData(sortedData);
            setLoading(false);
        }

        fetchChartData();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-on-surface-variant/30 font-display italic animate-pulse">
                Auditing financial trendlines...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center text-on-surface-variant/40 italic font-medium">
                Insufficient data to render financial projections.
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00342d" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#00342d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" stroke="#bfc9c420" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        stroke="#70797560" 
                        fontSize={10} 
                        fontWeight={700}
                        tickLine={false} 
                        axisLine={false} 
                        dy={15}
                        className="font-display uppercase tracking-widest"
                    />
                    <YAxis
                        stroke="#70797560"
                        fontSize={10}
                        fontWeight={700}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        className="font-display"
                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #bfc9c440', 
                            borderRadius: '12px', 
                            boxShadow: '0 24px 48px rgba(0,52,45,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-manrope)'
                        }}
                        itemStyle={{ color: '#1a1c1e' }}
                        cursor={{ stroke: '#00342d20', strokeWidth: 2 }}
                    />
                    <Legend 
                        verticalAlign="top" 
                        align="right" 
                        height={40}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">{value}</span>}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="income" 
                        name="Income" 
                        stroke="#00342d" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                        animationDuration={1500}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        name="Expenses" 
                        stroke="#ba1a1a80" 
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#colorExpense)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
