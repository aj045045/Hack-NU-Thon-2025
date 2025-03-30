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
    const pages: { title: string, link: string }[] = [
        { title: "About", link: "/" },
        { title: "Contact", link: "/" },
    ]

    const { data: session } = useSession();
    return (
        <>
            <nav className="flex items-center justify-between bg-background/60 backdrop-blur-lg w-full border-b border-b-border/20  z-50 h-16 overflow-hidden fixed px-5">

                {/*SECTION - Logo */}
                <div className="flex items-center space-x-4">
                    <Link href={pageLinks.home} passHref className="flex items-center space-x-2">
                        <Image src={assetsLinks.logo.src} width={100} height={100} alt={assetsLinks.logo.alt} />
                    </Link>
                    {/*!SECTION */}

                    {/*SECTION - Desktop Menu Bar */}
                    <NavigationMenu className="hidden lg:flex">
                        <NavigationMenuList>
                            <NavigationMenuItem className="group space-x-5 text-sm text-lime-100">
                                {pages.map((item, index) => (
                                    <Link className="py-2 px-3 hover:bg-lime-900/50 rounded-full" href={item.link} key={index}>{item.title}</Link>
                                ))}
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
                                            {pages.map((item, index) => (
                                                <Link href={item.link} className="bg-lime-900/50 text-lime-200 rounded-md px-4 py-2" key={index}>{item.title}</Link>
                                            ))}
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