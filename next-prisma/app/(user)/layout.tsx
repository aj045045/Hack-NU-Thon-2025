'use client'
import { FooterComp } from "@/components/footer";
import { NavbarComp } from "@/components/navbar";
import { SessionProvider } from "next-auth/react";

export default function UserLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <SessionProvider>
                <NavbarComp />
                <div className="min-h-screen w-full pt-20 mb-20">
                    {children}
                </div>
                <FooterComp />
            </SessionProvider>
        </>
    );
}