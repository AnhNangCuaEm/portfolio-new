'use client';

import { useState } from "react"
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { AwardsCertifications } from '@/components';
import TextType from '@/components/TextType';

export default function HomePage() {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const t = useTranslations();

    const handleEmailCopy = () => {
        setCopiedEmail(true);
        navigator.clipboard.writeText("thanhhailth1302@gmail.com");
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    return (
        <main role="main" className="flex min-h-screen w-full max-w-6xl mx-auto flex-col items-center justify-between pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
            <div className="w-full bg-white/2 backdrop-blur-xs rounded-4xl p-4 sm:p-8 border border-white/20 shadow-2xl">
                <div className="flex flex-col items-center gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
                        <div className="shrink-0 w-48 h-48 sm:w-56 sm:h-56 flex justify-center rounded-full overflow-hidden border-4 border-purple-500/40 scroll-animate scroll-fade-down">
                            <Image src="/avatar.png" alt="Avatar" width={310} height={395} className="h-full w-auto mt-2" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col text-center sm:text-left gap-4">
                            <h1 role="header" className="text-2xl sm:text-4xl font-bold text-white scroll-animate scroll-fade-up min-h-[1.5em] min-w-64 sm:min-w-68">
                                <TextType
                                    text={["Le Ly Thanh Hai", "レリタン ハイ"]}
                                    typingSpeed={80}
                                    deletingSpeed={40}
                                    pauseDuration={2500}
                                    loop={true}
                                    showCursor={true}
                                    cursorCharacter="|"
                                    cursorClassName="text-purple-400"
                                />
                            </h1>
                            <p className="text-lg sm:text-xl text-purple-400 scroll-animate scroll-fade-up scroll-delay-200">Full Stack Developer</p>
                            {/* Education */}
                            <div className="scroll-animate scroll-fade-up scroll-delay-200">
                                <p className="text-gray-300">
                                    {t('info.education')}
                                    <span className="text-purple-400 block ">{t('info.now')}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center flex flex-col gap-8">
                        {/* Contact Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <a href="https://github.com/AnhNangCuaEm" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors scroll-animate scroll-fade-up scroll-delay-100">
                                <i className="fab fa-github text-xl sm:text-2xl"></i>
                                <span>GitHub</span>
                            </a>
                            <a href="https://www.linkedin.com/in/haile1302/" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors scroll-animate scroll-fade-up scroll-delay-200">
                                <i className="fab fa-linkedin text-xl sm:text-2xl"></i>
                                <span>LinkedIn</span>
                            </a>
                            <div className="flex items-center text-gray-300 relative group scroll-animate scroll-fade-up scroll-delay-300" id="emailContainer">
                                <i className="fas fa-envelope text-xl sm:text-2xl mr-2"></i>
                                <span className="text-sm sm:text-base mr-1">thanhhailth1302@gmail.com</span>
                                <button
                                    onClick={handleEmailCopy}
                                    className="p-1 hover:bg-white/20 rounded-md transition-all duration-200 cursor-pointer"
                                    title={t('info.clicktocopy')}
                                >
                                    {copiedEmail ? (
                                        <svg
                                            className="w-5 h-5 text-green-600 animate-scale-check"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-5 h-5 text-gray-400 animate-fade-in"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* About Me */}
                        <p className="text-sm sm:text-lg text-gray-300 max-w-4xl mx-auto scroll-animate scroll-fade-up scroll-delay-300">
                            {t('info.description')}
                        </p>

                        {/* Highlight Skills */}
                        <div className="w-full scroll-animate scroll-fade-up scroll-delay-300">
                            <p className="text-xl text-purple-400 font-semibold mb-4 sm:mb-6 scroll-animate scroll-fade-up">{t('info.skills')}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Design */}
                                <div className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-purple-500/40 transition-all duration-300">
                                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <i className="fas fa-pen-nib text-purple-400 text-lg"></i>
                                    </div>
                                    <span className="text-white font-semibold text-sm">Design</span>
                                    <span className="text-gray-400 text-xs text-center leading-relaxed">Figma · Photoshop · Illustrator</span>
                                </div>
                                {/* Web Dev */}
                                <div className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                        <i className="fas fa-code text-indigo-400 text-lg"></i>
                                    </div>
                                    <span className="text-white font-semibold text-sm">Web Dev</span>
                                    <span className="text-gray-400 text-xs text-center leading-relaxed">Next.js · TypeScript · Tailwind</span>
                                </div>
                                {/* Database */}
                                <div className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-cyan-500/40 transition-all duration-300">
                                    <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <i className="fas fa-database text-cyan-400 text-lg"></i>
                                    </div>
                                    <span className="text-white font-semibold text-sm">Database</span>
                                    <span className="text-gray-400 text-xs text-center leading-relaxed">MySQL · PostgreSQL</span>
                                </div>
                                {/* WordPress */}
                                <div className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/3 border border-white/10 hover:border-sky-500/40 transition-all duration-300 cursor-default">
                                    <div className="w-11 h-11 rounded-xl bg-sky-500/20 flex items-center justify-center">
                                        <i className="fab fa-wordpress text-sky-400 text-lg"></i>
                                    </div>
                                    <span className="text-white font-semibold text-sm">WordPress</span>
                                    <span className="text-gray-400 text-xs text-center leading-relaxed">Themes · Plugins</span>
                                </div>
                            </div>
                        </div>

                        {/* Awards & Certifications */}
                        <AwardsCertifications />

                        {/* Interests */}
                        <div>
                            <h3 className="text-xl text-purple-400 font-semibold mb-4 sm:mb-6 scroll-animate scroll-fade-up">{t('info.interest')}</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                <div className="interest-tag-wrap scroll-animate scroll-fade-up scroll-delay-100">
                                    <span className="px-4 py-2 bg-white/10  rounded-full">
                                        <i className="fas fa-camera mr-2"></i>{t('info.interests.photography')}
                                    </span>
                                </div>
                                <div className="interest-tag-wrap scroll-animate scroll-fade-up scroll-delay-200">
                                    <span className="px-4 py-2 bg-white/10  rounded-full">
                                        <i className="fas fa-plane-departure mr-2"></i>{t('info.interests.traveling')}
                                    </span>
                                </div>
                                <div className="interest-tag-wrap scroll-animate scroll-fade-up scroll-delay-300">
                                    <span className="px-4 py-2 bg-white/10  rounded-full">
                                        <i className="fas fa-music mr-2"></i>{t('info.interests.music')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* About Me */}
                        <p className="text-sm sm:text-lg text-gray-300 max-w-4xl mx-auto scroll-animate scroll-fade-up scroll-delay-400">
                            {t('info.description2')}
                        </p>

                    </div>
                </div>
            </div>
        </main>
    );
}
