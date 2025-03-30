'use client'
import { LinkPreview } from "@/components/ui/link-preview";
import { assetsLinks } from "@/constants/assets";
import { pageLinks } from "@/constants/links";
import { LucideCopyright } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * The Global Footer component
 */
export function FooterComp() {
    const menuItems = [
        {
            title: "Product",
            links: [
                { text: "Overview", url: "/" },
                { text: "Pricing", url: "/" },
                { text: "Marketplace", url: "/" },
                { text: "Features", url: "/" },
            ],
        },
        {
            title: "Resources",
            links: [
                { text: "Community", url: "#" },
                { text: "Docs", url: "#" },
                { text: "Guides", url: "#" },
                { text: "Support", url: "/" },
                { text: "Pricing", url: "#" },
            ],
        },
        {
            title: "Company",
            links: [
                { text: "About", url: "/" },
                { text: "Blog", url: "/" },
                { text: "Team", url: "/" },
                { text: "Careers", url: "/" },
                { text: "Contact Us", url: "/" },
                { text: "Privacy Policy", url: "/" },
                { text: "Partners", url: "/" },
            ],
        },
        {
            title: "Social",
            links: [
                { src: assetsLinks.social.github.src, alt: assetsLinks.social.github.alt, text: "Github", url: pageLinks.social.github },
                { src: assetsLinks.social.linkedIn.src, alt: assetsLinks.social.linkedIn.alt, text: "LinkedIn", url: pageLinks.social.linkedIn },
                { src: assetsLinks.social.youtube.src, alt: assetsLinks.social.youtube.alt, text: "YouTube", url: pageLinks.social.youtube },
                { src: assetsLinks.social.instagram.src, alt: assetsLinks.social.instagram.alt, text: "Instagram", url: pageLinks.social.instagram },
                { src: assetsLinks.social.twitter.src, alt: assetsLinks.social.twitter.alt, text: "Twitter", url: pageLinks.social.twitter },
            ],
        },
    ]

    const bottomLinks = [
        { text: "Terms and Conditions", url: "/" },
        { text: "Privacy Policy", url: "/" },
    ]

    return (
        <div className="container font-sans pb-8">
            <footer>
                <div className="grid grid-cols-2 gap-8 px-5 pt-5 border-t lg:grid-cols-6 border-border">
                    <div className="col-span-2 mb-8 lg:mb-0">
                        <div className="flex items-center gap-2 lg:justify-start">
                            <Link href={pageLinks.home} className="flex items-center">
                                <Image
                                    src={assetsLinks.logo.src}
                                    alt={assetsLinks.logo.alt}
                                    title={"Fraxation Logo"}
                                    width={100}
                                    height={100}
                                />
                            </Link>
                        </div>
                        <blockquote className="pl-6 mt-6 italic border-l-2">
                            &quot;Let AI Handle Setup, You Handle Innovation.&quot;
                        </blockquote>
                    </div>
                    {menuItems.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h3 className="mb-4 font-bold">{section.title}</h3>
                            <ul className="space-y-4 text-green-950 text-sm">
                                {section.links.map((link, linkIdx) => (
                                    <div key={linkIdx}>
                                        {"src" in link ?
                                            (
                                                <div className="flex items-center space-x-1 hover:text-green-950 group">
                                                    <Image src={link.src} alt={link.alt} width={20} height={20} className="bg-lime-300/50 group-hover:bg-lime-300 rounded-xs" />
                                                    <LinkPreview
                                                        width={300}
                                                        height={200}
                                                        url={link.url}
                                                        className="hover:text-black text-green-900"
                                                    >
                                                        {link.text}
                                                    </LinkPreview>
                                                </div>
                                            ) : (
                                                <a href={link.url} className="flex items-center space-x-1 hover:text-black group">
                                                    <li>
                                                        {link.text}
                                                    </li>
                                                </a>
                                            )
                                        }
                                    </div>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-between gap-4 px-5 pt-8 mt-24 text-sm font-medium border-t border-border/80 text-foreground md:flex-row md:items-center">
                    <div className="flex items-center space-x-1">
                        <LucideCopyright size={12} />
                        <span>2025 Copyright. All rights reserved.</span>
                    </div>
                    <ul className="flex gap-4">
                        {bottomLinks.map((link, linkIdx) => (
                            <li key={linkIdx} className="underline hover:text-foreground">
                                <a href={link.url}>{link.text}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </footer >
        </div >
    );
};
