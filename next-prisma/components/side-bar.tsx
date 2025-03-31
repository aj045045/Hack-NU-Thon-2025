import { Home, LayoutDashboardIcon, LogOutIcon, Users, FileBarChart, UserPlus } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar"
import { pageLinks } from "@/constants/links"
import { Button } from "./ui/button"
import { signOut } from "next-auth/react"
import { AddUserSheet } from "@/components/add-user-sheet"

// Menu items.
const items = [
    {
        title: "Home",
        url: pageLinks.home,
        icon: Home,
    },
    {
        title: "Dashboard",
        url: pageLinks.admin.dashboard,
        icon: LayoutDashboardIcon,
    },
    {
        title: "Users",
        url: pageLinks.admin.users,
        icon: Users,
    },
    {
        title: "Reports",
        url: pageLinks.admin.reports,
        icon: FileBarChart,
    },
]

export function AdminSideBar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Applications</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild className="hover:bg-green-400 hover:border hover:border-green-600">
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <AddUserSheet />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button onClick={() => signOut({ callbackUrl: "/login" })} variant={"destructive"}>
                                        <LogOutIcon />
                                        <span>Logout</span>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
