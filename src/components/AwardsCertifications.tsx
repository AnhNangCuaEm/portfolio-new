'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

// ─── Types ─────────────────────

type ItemType = 'award' | 'certificate';

interface AwardItem {
    title: string;        // Japanese title
    engTitle: string;
    viTitle: string;
    project: string;
    issuer: string;       // Japanese issuer
    engIssuer: string;
    viIssuer: string;
    date: string;         // "YYYY-MM"
    type: ItemType;
    icon: string;         // FontAwesome class
    accentColor: string;
}

// ─── Accent colour tokens ──────────────────────────────────────────────────────

const accentMap: Record<string, { iconBg: string; iconText: string; meta: string }> = {
    amber: { iconBg: 'bg-amber-500/15', iconText: 'text-amber-400', meta: 'text-amber-400/70' },
    cyan: { iconBg: 'bg-cyan-500/15', iconText: 'text-cyan-400', meta: 'text-cyan-400/70' },
};

// ─── Type label map ────────────────────────────────────────────────────────────

const typeLabelMap: Record<ItemType, Record<string, string>> = {
    award: { ja: '賞', en: 'Award', vi: 'Giải thưởng' },
    certificate: { ja: '資格', en: 'Certificate', vi: 'Chứng chỉ' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AwardsCertifications() {
    const t = useTranslations();
    const locale = useLocale();

    const [items, setItems] = useState<AwardItem[]>([]);

    useEffect(() => {
        fetch('/awards.json')
            .then((r) => r.json())
            .then((data) => setItems(data.awards))
            .catch((e) => console.error('Failed to load awards.json', e));
    }, []);

    const getLocaleText = (item: AwardItem) => {
        const [year, month] = item.date.split('-');
        const date = locale === 'ja'
            ? `${year}年${parseInt(month, 10)}月`
            : `${month}/${year}`;

        if (locale === 'ja') return { title: item.title, issuer: item.issuer, label: typeLabelMap[item.type].ja, date };
        if (locale === 'vi') return { title: item.viTitle, issuer: item.viIssuer, label: typeLabelMap[item.type].vi, date };
        return { title: item.engTitle, issuer: item.engIssuer, label: typeLabelMap[item.type].en, date };
    };

    return (
        <div className="w-full mb-6">
            {/* Section heading */}
            <p className="text-xl text-purple-400 font-semibold mb-4 sm:mb-6 scroll-animate scroll-fade-up">
                {t('info.awards')}
            </p>

            {/* 2-col grid */}
            {items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                    {items.map((item, index) => {
                        const accent = accentMap[item.accentColor] ?? accentMap.amber;
                        const { title, issuer, label, date } = getLocaleText(item);

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 py-3 border-b border-white/10 last:border-b scroll-animate scroll-fade-left"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                {/* Icon bubble */}
                                <div className={`shrink-0 w-9 h-9 rounded-full ${accent.iconBg} flex items-center justify-center`}>
                                    <i className={`${item.icon} ${accent.iconText} text-sm`} />
                                </div>

                                {/* Text block */}
                                <div className="flex flex-col text-left">
                                    {/* Title + optional project */}
                                    <span className="text-white text-sm font-semibold leading-snug truncate">
                                        {title}
                                        {item.project && (
                                            <span className="text-gray-300 font-normal"> · {item.project}</span>
                                        )}
                                    </span>

                                    {/* Issuer · Type label · Date */}
                                    <span className="text-gray-400 text-xs mt-0.5 truncate">
                                        {issuer}
                                        <span className="mx-1">·</span>
                                        {date}
                                        <span className="mx-1">·</span>
                                        <span className={accent.meta}>{label}</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
