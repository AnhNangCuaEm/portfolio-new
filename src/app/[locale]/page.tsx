'use client';

import { useState } from "react"
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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
                        <div className="w-32 h-32 sm:w-48 sm:h-48 flex justify-center rounded-full overflow-hidden border-4 border-purple-500/30 scroll-animate scroll-fade-down">
                            <Image src="/avatar.png" alt="Avatar" width={310} height={395} className="h-full w-auto mt-2" />
                        </div>
                        <div className="text-center">
                            <h1 role="header" className="text-2xl sm:text-4xl font-bold text-white mb-2 scroll-animate scroll-fade-up">Le Ly Thanh Hai</h1>
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 scroll-animate scroll-fade-up scroll-delay-100">レリタン ハイ</h2>
                            <p className="text-lg sm:text-xl text-purple-400 mb-4 scroll-animate scroll-fade-up scroll-delay-200">Full Stack Developer</p>

                            {/* Education */}
                            <div className="mb-6 scroll-animate scroll-fade-up scroll-delay-200">
                                <h2 className="text-xl text-white font-semibold mb-2">{t('info.edu')}</h2>
                                <p className="text-gray-300">
                                    {t('info.education')}
                                    <span className="text-purple-400 block text-md">{t('info.now')}</span>
                                </p>
                            </div>

                            {/* About Me */}
                            <p className="text-sm sm:text-lg text-gray-300 max-w-4xl mx-auto mb-6 scroll-animate scroll-fade-up scroll-delay-300">
                                {t('info.description')}
                            </p>
                            <p className="text-sm sm:text-lg text-gray-300 max-w-4xl mx-auto mb-6 scroll-animate scroll-fade-up scroll-delay-400">
                                {t('info.description2')}
                            </p>

                            {/* Interests */}
                            <div className="mb-6">
                                <h2 className="text-xl text-white font-semibold mb-3 scroll-animate scroll-fade-up">{t('info.interest')}</h2>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up scroll-delay-100">
                                        <i className="fas fa-camera mr-2"></i>{t('info.interests.photography')}
                                    </span>
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up scroll-delay-200">
                                        <i className="fas fa-plane-departure mr-2"></i>{t('info.interests.traveling')}
                                    </span>
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up scroll-delay-300">
                                        <i className="fas fa-music mr-2"></i>{t('info.interests.music')}
                                    </span>
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up scroll-delay-400">
                                        <i className="fas fa-code mr-2"></i>{t('info.interests.coding')}
                                    </span>
                                </div>
                            </div>

                            {/* Current Learning */}
                            <div className="mb-6">
                                <h2 className="text-xl text-white font-semibold mb-3 scroll-animate scroll-fade-up">{t('info.learning')}</h2>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up">{t('info.learnings.nextjs')}</span>
                                    <span className="px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 border-white/20 border scroll-animate scroll-fade-up">{t('info.learnings.ios')}</span>
                                </div>
                            </div>

                            {/* Contact Links */}
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
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
                                        className="p-1 hover:bg-gray-300 rounded-md transition-all duration-200 cursor-pointer"
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
                        </div>
                    </div>
                </div>
            </main>
    );
}
