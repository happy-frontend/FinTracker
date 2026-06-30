"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Receipt, 
    TrendingUp, 
    TrendingDown, 
    Users, 
    Briefcase,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/login/actions";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Bookings", href: "/bookings", icon: Receipt },
    { name: "Income", href: "/income", icon: TrendingUp },
    { name: "Expenses", href: "/expenses", icon: TrendingDown },
    { name: "Investments", href: "/investments", icon: Briefcase },
    { name: "Partners", href: "/partners", icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center justify-between p-4 bg-surface-container-lowest border-b border-outline-variant/15 w-full z-50 fixed top-0 h-16 shadow-sm">
                <h1 className="text-xl font-display font-bold text-primary tracking-tight">Gill Brothers Crockery Services</h1>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-on-surface hover:text-primary transition-colors focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-surface-dim/20 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col bg-surface-container-low border-r border-outline-variant/10 shadow-sm transform transition-transform duration-500 ease-out",
                "md:relative md:translate-x-0 md:bg-surface-container-low/50 md:backdrop-blur-md",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand Section */}
                <div className="flex h-24 items-center px-8 hidden md:flex">
                    <h1 className="text-2xl font-display font-bold text-primary tracking-tight decoration-emerald-500/30 underline-offset-8">
                        Gill Brothers Crockery Services
                    </h1>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-8 mt-16 md:mt-0 space-y-1.5 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40 mb-4">
                        Management
                    </p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]"
                                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary active:scale-95"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "mr-4 h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                                        isActive ? "text-on-primary" : "text-on-surface-variant/60"
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Account Section */}
                <div className="p-6 bg-surface-container/30 border-t border-outline-variant/10 mt-auto">
                    <div className="flex items-center justify-between bg-surface-container-lowest p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/5 hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center">
                            <div className="relative group">
                                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-display font-semibold text-sm shadow-md shadow-primary/30">
                                    FT
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-success border-2 border-surface rounded-full shadow-sm"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-on-surface font-display leading-tight">Happy</p>
                                <p className="text-[11px] font-medium text-on-surface-variant/70 tracking-tight">Owner</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => logout()}
                            className="p-2.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all duration-300 rounded-lg"
                            title="Log Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
