'use client'
import { AdminSideBar } from "@/components/side-bar";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createContext, useState, Dispatch, SetStateAction, useContext, useEffect } from "react";

type AdminLayoutContextType = Dispatch<SetStateAction<string>>;
const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sideText, setSideText] = useState("");
    return (
        <AdminLayoutContext.Provider value={setSideText}>
            <SidebarProvider defaultOpen={false}>
                <AdminSideBar />
                <main className="w-full">
                    <div className="flex items-center justify-between px-2 py-4 h-12 w-fit space-x-4">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="bg-green-800" />
                        <span className="font-bold text-center">{sideText}</span>
                    </div>
                    <div className="py-2 px-4 text-green-50">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </AdminLayoutContext.Provider>
    );
}


export function useSetAdminText(text: string) {
    const setSideText = useContext(AdminLayoutContext);

    useEffect(() => {
        if (setSideText) {
            setSideText(text);
        }
    }, [setSideText, text]);
}