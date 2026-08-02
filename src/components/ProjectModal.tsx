'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import { X, Github, ExternalLink } from 'lucide-react';

interface Project {
    title: string;
    subtitle: string;
    engSub: string;
    viSub: string;
    description: string;
    engDes: string;
    viDes: string;
    url: string;
    github: string;
    technologies: string[];
    education: boolean;
    development: boolean;
    thumb: string;
    gallery: string[];
    team: Array<{
        name: string;
        role: string;
        responsibilities: string;
    }>;
}

interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const locale = useLocale();
    const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imageDimensions, setImageDimensions] = useState<{ [key: string]: { width: number; height: number } }>({});

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize PhotoSwipe
        const lightbox = new PhotoSwipeLightbox({
            gallery: '.pswp-gallery',
            children: 'a',
            pswpModule: () => import('photoswipe'),
        });

        lightbox.init();
        lightboxRef.current = lightbox;

        return () => {
            lightbox.destroy();
        };
    }, [isOpen]);

    // Disable scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    const description = locale === 'ja'
        ? project?.description
        : locale === 'vi'
            ? project?.viDes
            : project?.engDes;
    const subtitle = locale === 'ja'
        ? project?.subtitle
        : locale === 'vi'
            ? project?.viSub
            : project?.engSub;

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

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, imageSrc: string) => {
        const img = e.currentTarget;
        setImageDimensions(prev => ({
            ...prev,
            [imageSrc]: {
                width: img.naturalWidth,
                height: img.naturalHeight
            }
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && project && (
                <motion.div
                    key="modal-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-99 flex items-center justify-center p-4"
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
                        className="rounded-3xl backdrop-blur-2xl shadow-2xl max-h-[70vh] overflow-y-auto w-full max-w-4xl border border-purple-500/20 z-99"
                    >
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="sticky top-0 flex justify-between items-center p-4 sm:p-6 border-b border-purple-500/10 backdrop-blur-xl bg-black/80 rounded-t-3xl z-50"
                        >
                            <div>
                                <h1 className="text-3xl font-bold text-white">{project.title}</h1>
                                <p className="text-purple-300 text-md mt-1">{subtitle}</p>
                                {project.development && (
                                    <span className="text-yellow-500 text-md font-semibold">
                                        {locale === 'ja' ? '(開発中)' : '(In Development)'}
                                    </span>
                                )}
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
                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className='flex items-center justify-between mb-2'>
                                    <h2 className="text-xl text-nowrap font-semibold text-purple-300">
                                        {locale === 'ja' ? '説明' : 'Description'}
                                    </h2>
                                    {/* Links */}
                                    <div className="flex justify-end flex-wrap gap-3">
                                        {project.url && (
                                            <Link
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                {locale === 'ja' ? 'ウェブサイト' : 'Website'}
                                            </Link>
                                        )}
                                        {project.github && (
                                            <Link
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                <Github className="w-4 h-4" />
                                                GitHub
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-200 leading-relaxed">{description}</p>
                            </motion.div>

                            {/* Education Note */}
                            {project.education && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                                >
                                    <p className="text-blue-300 text-sm">
                                        {locale === 'ja' ? '※ このサイトは、学習目的のプロジェクトです。' : '* This site is for educational purposes.'}
                                    </p>
                                </motion.div>
                            )}

                            {/* Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}>
                                <h2 className="text-lg font-semibold text-purple-300 mb-3">
                                    {locale === 'ja' ? 'ギャラリー' : 'Gallery'}
                                </h2>
                                <div
                                    className="pswp-gallery grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min"
                                    role="region"
                                    aria-label="Project gallery"
                                >
                                    {project.gallery.map((image, index) => {
                                        const dims = imageDimensions[image];
                                        return (
                                            <a
                                                key={index}
                                                href={image}
                                                data-pswp-width={dims?.width || 970}
                                                data-pswp-height={dims?.height || 687}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="overflow-hidden rounded-lg cursor-zoom-in group h-fit"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${project.title} gallery ${index + 1}`}
                                                    className="w-full max-h-60 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                                                    loading="lazy"
                                                    onLoad={(e) => handleImageLoad(e, image)}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Technologies */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}>
                                <h2 className="text-lg font-semibold text-purple-300 mb-3">
                                    {locale === 'ja' ? '技術' : 'Technologies'}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.technologies.map((tech, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-purple-500/20 text-purple-300 backdrop-blur-sm text-sm font-medium rounded-full border border-purple-500/50"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Team */}
                            {project.team && project.team.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}>
                                    <h2 className="text-lg font-semibold text-purple-300 mb-3">
                                        {locale === 'ja' ? 'チーム' : 'Team'}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {project.team.map((member, index) => (
                                            <div
                                                key={index}
                                                className="p-3 bg-gray-400/20 rounded-lg border border-gray-700/50"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-white">{member.name}</h3>
                                                    <span className="text-xs px-2 py-1 bg-purple-500/30 text-purple-300 rounded">
                                                        {member.role}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">{member.responsibilities}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
