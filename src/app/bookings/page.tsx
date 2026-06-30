"use client";

import { BookingForm } from "@/components/ui/booking-form";
import { ReceiptText } from "lucide-react";

export default function BookingsPage() {
    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-8">
                <div className="max-w-2xl">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-primary leading-tight">
                        Bookings & Events
                    </h1>
                    <p className="text-lg text-on-surface-variant font-medium mt-3 max-w-lg leading-relaxed">
                        Add a new booking — income and expenses in one place.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="max-w-5xl">
                <div className="surface-paper overflow-hidden">
                    <div className="bg-primary/5 px-8 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                        <h2 className="text-sm font-display font-bold uppercase tracking-[0.2em] text-primary/70 flex items-center gap-2">
                            <ReceiptText className="w-4 h-4" />
                            New Booking
                        </h2>
                    </div>
                    <div className="p-8 md:p-12">
                        <BookingForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
