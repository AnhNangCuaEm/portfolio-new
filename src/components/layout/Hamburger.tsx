'use client';

import { useState } from 'react';
import { Fade as Hamburger } from 'hamburger-react';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { href: "/", label: "Info" },
        { href: "/skills", label: "Skills" },
        { href: "/projects", label: "Projects" },
        { href: "/awards", label: "Awards" },
        { href: "/contact", label: "Contact" },
    ];

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button with Background Circle - Show on mobile */}
            <div className="md:hidden fixed top-4 right-4 z-40">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors duration-300 backdrop-blur-sm border border-white/10">
                    <Hamburger
                        toggled={isOpen}
                        toggle={setIsOpen}
                        color="#ffffff"
                        size={28}
                    />
                </div>
            </div>

            {/* Overlay Fullscreen Menu with Fade Animation */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    {/* Navigation - Centered */}
                    <nav className="h-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ul className="flex flex-col items-center space-y-8 text-2xl font-semibold">
                            {navItems.map((item, index) => (
                                <li 
                                    key={item.href}
                                    style={{
                                        animation: `fadeInUp 0.5s ease-out ${0.1 * (index + 1)}s both`
                                    }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={closeMenu}
                                        className="text-white hover:opacity-70 transition-opacity duration-300"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            <li 
                                className="mt-8"
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${0.1 * (navItems.length + 1)}s both`
                                }}
                            >
                                <LanguageSwitcher />
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}