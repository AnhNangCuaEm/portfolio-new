'use client';

import Header from "@/components/layout/Header";
import HamburgerMenu from "@/components/layout/Hamburger";
import { AwardsModal } from "@/components";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";

interface Award {
    title: string;
    engTitle: string;
    project: string;
    pjURL: string;
    issuer: string;
    engIssuer: string;
    date: string;
    description: string;
    engDescription: string;
    img: string;
}

export default function AwardsPage() {
    const locale = useLocale();
    const [isLoading, setIsLoading] = useState(true);
    const [awards, setAwards] = useState<Award[]>([]);
    const [selectedAward, setSelectedAward] = useState<Award | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('/awards.json')
            .then((res) => res.json())
            .then((data) => {
                setAwards(data.awards);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error loading awards:', error);
                setIsLoading(false);
            });
    }, []);

    const handleAwardClick = (award: Award) => {
        setSelectedAward(award);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedAward(null), 300);
    };

    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <HamburgerMenu />
            <main className="w-full pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Loading state */}
                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[400px]">
                            <div className="text-white">Loading...</div>
                        </div>
                    ) : (
                        /* Grid 3 cols */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                            {awards.map((award, index) => {
                                const title = locale === "ja" ? award.title : award.engTitle;
                                const issuer = locale === "ja" ? award.issuer : award.engIssuer;
                                const description = locale === "ja" ? award.description : award.engDescription;
                                const formattedDate = new Date(award.date).toLocaleDateString(
                                    locale === "ja" ? "ja-JP" : "en-US",
                                    { year: "numeric", month: "long", day: "numeric" }
                                );

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleAwardClick(award)}
                                        className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-400 ease-in-out cursor-pointer scroll-animate scroll-fade-up"
                                        style={{
                                            aspectRatio: "3 / 4",
                                            animationDelay: `${Math.min(index * 100, 600)}ms`,
                                        }}
                                    >
                                        {/* Background image */}
                                        <div
                                            className="absolute inset-0 bg-cover rounded-3xl bg-center blur-[3px]"
                                            style={{
                                                backgroundImage: `url('${award.img}')`,
                                            }}
                                        />

                                        {/* Blur overlay */}
                                        <div className="absolute inset-0 bg-black/40 rounded-3xl" />

                                        {/* Content */}
                                        <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                            {/* Date at top */}
                                            <div>
                                                <p className="text-sm text-purple-200 font-semibold">
                                                    {formattedDate}
                                                </p>
                                            </div>

                                            {/* Title and Info */}
                                            <div>
                                                <h2 className="text-3xl font-bold mb-1 line-clamp-2">
                                                    {title}
                                                </h2>
                                                <p className="text-md text-purple-100 mb-3 line-clamp-1">
                                                    {issuer}
                                                </p>
                                                <p className="text-md text-white/90 line-clamp-3">
                                                    {description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            <AwardsModal
                award={selectedAward}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
}
