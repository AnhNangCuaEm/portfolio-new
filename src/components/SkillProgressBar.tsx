'use client';

import { useEffect, useRef, useState } from 'react';

export interface SkillProgressBarProps {
    name: string;
    level: number;
    delay?: number;
}

export default function SkillProgressBar({ name, level, delay = 0 }: SkillProgressBarProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="w-full">
            <div className="flex justify-between items-center mb-2">
                <span className="text-gray-200 font-medium">{name}</span>
                <span className="text-purple-400 font-semibold">{level}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/10">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: isVisible ? `${level}%` : '0%',
                        transitionDelay: `${delay}ms`,
                    }}
                />
            </div>
        </div>
    );
}
