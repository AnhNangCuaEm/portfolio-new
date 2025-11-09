'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

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

interface AwardsModalProps {
    award: Award | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AwardsModal({ award, isOpen, onClose }: AwardsModalProps) {
    const locale = useLocale();
    const containerRef = useRef<HTMLDivElement>(null);

    // Disable scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    const title = locale === 'ja' ? award?.title : award?.engTitle;
    const issuer = locale === 'ja' ? award?.issuer : award?.engIssuer;
    const description = locale === 'ja' ? award?.description : award?.engDescription;

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.75,
            y: 30,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
        },
        exit: {
            opacity: 0,
            scale: 0.75,
            y: 30,
        },
    };

    return (
        <AnimatePresence>
            {isOpen && award && (
                <motion.div
                    key="modal-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        ref={containerRef}
                        key="modal-content"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 40,
                        }}
                        className="rounded-3xl backdrop-blur-2xl shadow-2xl max-h-[85vh] overflow-y-auto w-full max-w-2xl border border-purple-500/20 z-99"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-0 flex justify-between items-center p-4 sm:p-6 border-b border-purple-500/10 backdrop-blur-xl bg-black/80 rounded-t-3xl"
                        >
                            <div>
                                <h1 className="text-3xl font-bold text-white">{title}</h1>
                                <p className="text-purple-300 text-sm mt-1">{issuer}</p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-2 hover:bg-purple-500/40 rounded-lg transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6 text-white" />
                            </motion.button>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="p-4 sm:p-6 space-y-6"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <p className="text-sm font-semibold text-purple-300 mb-2">
                                    {locale === 'ja' ? 'プロジェクト' : 'Project'}
                                </p>
                                <div className='flex justify-between items-center'>
                                    <p className="text-2xl font-bold text-gray-200">{award.project}</p>
                                    {award.pjURL && (<div>
                                        <Link href={award.pjURL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                            {locale === 'ja' ? 'ウェブサイト' : 'Website'}
                                        </Link>
                                    </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Date */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <p className="text-sm font-semibold text-purple-300 mb-2">
                                    {locale === 'ja' ? '受賞日' : 'Award Date'}
                                </p>
                                <p className="text-gray-200">
                                    {new Date(award.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <h2 className="text-sm font-semibold text-purple-300 mb-2">
                                    {locale === 'ja' ? '説明' : 'Description'}
                                </h2>
                                <p className="text-gray-200 leading-relaxed">{description}</p>
                            </motion.div>

                            {/* Image */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="relative w-full rounded-lg shadow-lg overflow-hidden">
                                    <Image
                                        src={award.img}
                                        alt={title || 'Award image'}
                                        width={800}
                                        height={600}
                                        className="object-cover"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
