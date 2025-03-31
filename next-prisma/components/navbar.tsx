'use client'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import Link from "next/link";
import { LucideMenu } from "lucide-react"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { SearchBarComp } from "./search";
import { assetsLinks } from "@/constants/assets";
import { pageLinks } from "@/constants/links";
import { signOut, useSession } from "next-auth/react";

/**
 * The Global Navbar component 
 */
export function NavbarComp() {
    const { data: session } = useSession();

    return (
        <>
            <nav className="flex items-center justify-between bg-background/40 backdrop-blur-lg w-full border-b border-b-border  z-50 h-16 overflow-hidden fixed px-5">

                {/*SECTION - Logo */}
                <div className="flex items-center space-x-4">
                    <Link href={pageLinks.home} passHref className="flex items-center space-x-2">
                        <Image src={assetsLinks.logo.src} width={100} height={100} alt={assetsLinks.logo.alt} />
                    </Link>
                    {/*!SECTION */}

                    {/*SECTION - Desktop Menu Bar */}
                    <NavigationMenu className="hidden lg:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem className="group space-x-5 text-sm text-green-950">
                                {session &&
                                    (
                                        !session.user.isAdmin ? (
                                            <>
                                                <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.profile}>Profile</Link>
                                                <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.transaction}>Transaction</Link>
                                                <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.fraudDetection}>Fraud Report</Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.admin.dashboard}>Dashboard</Link>
                                            </>
                                        )
                                    )}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                {/*!SECTION */}

                {/*SECTION - Navigation Side View*/}
                <NavigationMenu className="right-0">
                    <NavigationMenuList>
                        <NavigationMenuItem className="group space-x-5 flex-row">
                            {/* Navigation Menu Mobile bar*/}
                            <Drawer>
                                <div className="flex-row flex items-center space-x-2">
                                    <SearchBarComp />
                                    {session ? (
                                        <Button onClick={() => signOut({ callbackUrl: "/login" })} variant={"destructive"} >Logout</Button>
                                    ) : (
                                        <>
                                            <Link href={pageLinks.login} passHref>
                                                <Button>Login</Button>
                                            </Link>
                                            <Link href={pageLinks.sign_up} passHref>
                                                <Button className="hover:bg-lime-50 hover:text-lime-950" variant={"outline"} >Sign Up</Button>
                                            </Link>
                                        </>
                                    )}
                                    <DrawerTrigger className="flex lg:hidden"><LucideMenu /></DrawerTrigger>
                                </div>
                                <DrawerContent className="border-t">
                                    <div className="mx-auto md:w-5/6 w-full overflow-y-scroll no-scrollbar">
                                        <DrawerHeader className="space-y-1">
                                            <DrawerTitle></DrawerTitle>
                                            {session &&
                                                (
                                                    !session.user.isAdmin ? (
                                                        <>
                                                            <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.profile}>Profile</Link>
                                                            <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.transaction}>Transaction</Link>
                                                            <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.user.fraudDetection}>Fraud Report</Link>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link className="py-2 px-3 hover:bg-green-500 rounded-full" href={pageLinks.admin.dashboard}>Dashboard</Link>
                                                        </>
                                                    )
                                                )}
                                        </DrawerHeader>
                                        <DrawerFooter>
                                            <DrawerClose>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </div>
                                </DrawerContent>
                            </Drawer>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                {/*!SECTION */}

            </nav >
        </>
    )
}