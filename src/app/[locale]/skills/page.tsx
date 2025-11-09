'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from "@/components/layout/Header";
import HamburgerMenu from "@/components/layout/Hamburger";
import SkillProgressBar from "@/components/SkillProgressBar";

interface Skill {
    name: string;
    level: number;
    native?: boolean;
}

interface SkillsData {
    skills: {
        web: Skill[];
        design: Skill[];
        softSkills: Skill[];
        languages: Skill[];
    };
}

export default function SkillsPage() {
    const t = useTranslations();
    const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await fetch('/skills.json');
                const data = await response.json();
                setSkillsData(data);
            } catch (error) {
                console.error('Failed to load skills data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, []);

    const renderSkillCategory = (
        title: string,
        skills: Skill[],
        categoryIndex: number
    ) => {
        const sortedSkills = [...skills].sort((a, b) => b.level - a.level);
        
        return (
        <div className="scroll-animate scroll-fade-up scroll-duration-normal" style={{ animationDelay: `${categoryIndex * 100}ms` }}>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-purple-500/30">
                    {title}
                </h2>
                <div className="space-y-6">
                    {sortedSkills.map((skill, index) => (
                        <div key={`${skill.name}-${index}`} style={{ animationDelay: `${categoryIndex * 100 + index * 50}ms` }}>
                            <SkillProgressBar
                                name={skill.native ? `${skill.name} (Native)` : skill.name}
                                level={skill.level}
                                delay={index * 100}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    };

    return (
        <div className="flex flex-col items-center min-h-screen">
            <Header />
            <HamburgerMenu />
            <main className="flex min-h-screen w-full max-w-6xl flex-col items-center pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
                <div className="w-full">
                    {loading ? (
                        <div className="text-center text-gray-300">
                            <p>Loading skills...</p>
                        </div>
                    ) : skillsData ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-3 gap-12">
                            {/* Web Development */}
                            <div className="row-span-2 bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10">
                                {renderSkillCategory(
                                    t('skills.web'),
                                    skillsData.skills.web,
                                    0
                                )}
                            </div>

                            {/* Design */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10">
                                {renderSkillCategory(
                                    t('skills.design'),
                                    skillsData.skills.design,
                                    1
                                )}
                            </div>

                            {/* Soft Skills */}
                            <div className="lg:col-start-2 lg:row-start-2 bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10">
                                {renderSkillCategory(
                                    t('skills.softSkills'),
                                    skillsData.skills.softSkills,
                                    2
                                )}
                            </div>

                            {/* Languages */}
                            <div className="lg:col-span-2 lg:row-start-3 h-fit bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10">
                                {renderSkillCategory(
                                    t('skills.languages'),
                                    skillsData.skills.languages,
                                    3
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-300">
                            <p>Failed to load skills data</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
