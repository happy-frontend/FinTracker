"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <>
            {!isLoginPage && <Sidebar aria-label="Main Navigation" />}
            <main className={cn("flex-1 overflow-y-auto", !isLoginPage ? "pt-16 md:pt-0" : "pt-0")}>
                <div className="max-w-[1600px] mx-auto p-8 md:p-12 lg:p-16">
                    {children}
                </div>
            </main>
        </>
    );
}
