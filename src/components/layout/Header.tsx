import GlassHeader from "@/components/GlassHeader";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {

    const navItems = [
        { href: "/", label: "Info" },
        { href: "/skills", label: "Skills" },
        { href: "/projects", label: "Projects" },
        { href: "/awards", label: "Awards" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <header className="hidden w-fit md:fixed md:flex justify-center mx-4 sm:mx-0 mt-4 mb-4 sm:mb-8 z-50">
            <GlassHeader className="h-fit justify-between">
                <nav>
                    <ul className="flex items-center space-x-6 text-xl font-semibold px-2 py-1">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href}
                                    className="hover:opacity-70 transition-opacity duration-300">{item.label}
                                </Link>
                            </li>
                        ))}
                        <li className="flex items-center">
                            <LanguageSwitcher />
                        </li>
                    </ul>
                </nav>
            </GlassHeader>
        </header>
    );
}