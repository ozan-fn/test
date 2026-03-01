"use client";

import { useState } from "react";
import { MobileNav, MobileNavHeader, MobileNavMenu, MobileNavToggle, Navbar, NavbarButton, NavbarLogo, NavBody, NavItems } from "./ui/resizable-navbar";
import { ModeToggle } from "./mode-toggle";

export const Header = () => {
    const navItems = [
        {
            name: "Beranda",
            link: "#features",
        },
        {
            name: "Pricing",
            link: "#pricing",
        },
        {
            name: "Contact",
            link: "#contact",
        },
    ];

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    return (
        <Navbar className="top-0">
            {/* Desktop Navigation */}
            <NavBody>
                <NavbarLogo />
                <NavItems items={navItems} />
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <ModeToggle />
                    </div>
                    <NavbarButton variant="secondary">Login</NavbarButton>
                    <NavbarButton variant="primary">Book a call</NavbarButton>
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <NavbarLogo />
                    <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                </MobileNavHeader>

                <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                    {navItems.map((item, idx) => (
                        <a key={`mobile-link-${idx}`} href={item.link} onClick={() => setIsMobileMenuOpen(false)} className="relative text-neutral-600 dark:text-neutral-300">
                            <span className="block">{item.name}</span>
                        </a>
                    ))}
                    <div className="flex w-full flex-col gap-4">
                        <div className="relative">
                            <ModeToggle />
                        </div>
                        <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                            Login
                        </NavbarButton>
                        <NavbarButton onClick={() => setIsMobileMenuOpen(false)} variant="primary" className="w-full">
                            Book a call
                        </NavbarButton>
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
};
