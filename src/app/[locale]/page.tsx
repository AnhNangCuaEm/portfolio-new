import { useTranslations } from 'next-intl';
import Header from "@/components/layout/Header";
import Image from 'next/image';

export default function HomePage() {
    const t = useTranslations();

    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between py-32 px-8">
                {/* info and images */}
                <div className="flex gap-16">
                    <div className='text-center'>
                        <h1 className="text-4xl font-bold mb-2">
                            Le Ly Thanh Hai
                        </h1>
                        <p className="text-2xl mb-2">
                            レリタン ハイ
                        </p>
                        <p className="text-lg text-purple-400 font-medium">
                            Full Stack Developer
                        </p>
                    </div>

                    <div className='px-4 pt-4 border-2 border-gray-300 rounded-3xl shadow-lg overflow-hidden'>
                        <Image
                            src="/avatar.png"
                            alt="Hero Image"
                            width={300}
                            height={300}
                            className="w-full h-auto scroll-animate scroll-fade-up"
                        />
                    </div>
                </div>

                <div>
                </div>
            </main>
        </div>
    );
}
