"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, startOfDay, endOfDay, subDays } from "date-fns";
import { Calendar, ChevronDown, CalendarDays, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRange = {
    label: string;
    startDate: Date | null;
    endDate: Date | null;
};

// We define a function to get ranges dynamically so 'new Date()' is fresh.
const getPredefinedRanges = (): DateRange[] => [
    { label: "Today", startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) },
    { label: "Last 7 days", startDate: startOfDay(subDays(new Date(), 7)), endDate: endOfDay(new Date()) },
    { label: "Last 14 days", startDate: startOfDay(subDays(new Date(), 14)), endDate: endOfDay(new Date()) },
    { label: "This Month", startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) },
    { label: "Last Month", startDate: startOfMonth(subMonths(new Date(), 1)), endDate: endOfMonth(subMonths(new Date(), 1)) },
    { label: "This Year", startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) },
    { label: "All Time", startDate: null, endDate: null },
];

export function DateFilter({
    selectedRange,
    onChange
}: {
    selectedRange: DateRange;
    onChange: (range: DateRange) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const predefinedRanges = getPredefinedRanges();

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCustom(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleApplyCustom = () => {
        if (customStart && customEnd) {
            onChange({
                label: "Custom",
                startDate: startOfDay(new Date(customStart)),
                endDate: endOfDay(new Date(customEnd))
            });
            setIsOpen(false);
            setShowCustom(false);
        }
    };

    const inputClasses = "w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 text-on-surface text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300";
    const labelClasses = "block text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.1em] mb-1.5 px-0.5";

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    className={cn(
                        "inline-flex items-center gap-x-2.5 rounded-xl px-5 py-2.5 text-sm font-display font-bold transition-all duration-300 shadow-sm border",
                        isOpen 
                            ? "bg-primary text-on-primary border-primary" 
                            : "bg-surface-container-low text-primary border-outline-variant/10 hover:bg-surface-container-high hover:border-primary/20"
                    )}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <Calendar className={cn("h-4 w-4", isOpen ? "text-on-primary/60" : "text-primary/40")} />
                    <span className="tracking-wide uppercase text-[11px]">{selectedRange.label}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180 opacity-60", !isOpen && "opacity-20")} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-72 origin-top-right rounded-2xl bg-surface-container-lowest shadow-[0_32px_64px_rgba(0,52,45,0.12)] border border-outline-variant/10 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200" role="menu">
                    {!showCustom ? (
                        <div className="py-2" role="none">
                            <div className="px-5 py-3 border-b border-outline-variant/5 bg-primary/5 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Temporal Presets</span>
                            </div>
                            {predefinedRanges.map((range, idx) => {
                                const isActive = selectedRange.label === range.label;
                                return (
                                    <button
                                        key={idx}
                                        className={cn(
                                            "flex items-center justify-between w-full text-left px-5 py-2.5 text-sm transition-all duration-200",
                                            isActive 
                                                ? 'text-primary bg-primary/5 font-bold' 
                                                : 'text-on-surface-variant/70 hover:bg-surface-container hover:text-primary'
                                        )}
                                        onClick={() => {
                                            onChange(range);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-display uppercase tracking-widest text-[11px]">{range.label}</span>
                                            {range.startDate && range.endDate && !isActive && (
                                                <span className="text-[9px] font-bold text-on-surface-variant/40 mt-0.5">
                                                    {format(range.startDate, 'MMM d')} — {format(range.endDate, 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                        {isActive && <Check className="w-4 h-4 text-primary" />}
                                    </button>
                                );
                            })}
                            
                            {/* Custom Range Option */}
                            <div className="border-t border-outline-variant/5 mt-2 pt-2">
                                <button
                                    className={cn(
                                        "flex items-center justify-between w-full text-left px-5 py-3 text-sm transition-all duration-200",
                                        selectedRange.label === 'Custom' 
                                            ? 'text-primary bg-primary/5 font-bold' 
                                            : 'text-on-surface-variant/70 hover:bg-surface-container hover:text-primary'
                                    )}
                                    onClick={() => setShowCustom(true)}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-3.5 h-3.5 opacity-40" />
                                            <span className="font-display uppercase tracking-widest text-[11px]">Custom Range</span>
                                        </div>
                                        {selectedRange.label === 'Custom' && selectedRange.startDate && selectedRange.endDate && (
                                            <span className="text-[9px] font-bold text-primary/60 mt-1">
                                                {format(selectedRange.startDate, 'MMM d, yyyy')} — {format(selectedRange.endDate, 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className="-rotate-90 w-4 h-4 opacity-20" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <button 
                                    onClick={() => setShowCustom(false)}
                                    className="p-1.5 hover:bg-primary/5 rounded-lg text-primary transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <span className="font-display font-bold text-[11px] uppercase tracking-widest text-primary/60">Define custom span</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClasses}>Commencement (Start)</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Conclusion (End)</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleApplyCustom}
                                disabled={!customStart || !customEnd}
                                className="btn-primary w-full shadow-lg shadow-primary/20 text-[11px]"
                            >
                                Apply Temporal Range
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
