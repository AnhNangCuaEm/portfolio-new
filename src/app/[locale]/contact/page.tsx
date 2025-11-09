import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import HamburgerMenu from "@/components/layout/Hamburger";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
    const t = useTranslations('contact');

    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <HamburgerMenu />
            <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
                <div className="w-full max-w-3xl text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4 scroll-animate scroll-fade-up">
                        {t('title')}
                    </h1>
                    <p className="text-gray-300 text-lg scroll-animate scroll-fade-up delay-100">
                        {t('subtitle')}
                    </p>
                </div>
                <ContactForm />
            </main>
        </div>
    );
}
