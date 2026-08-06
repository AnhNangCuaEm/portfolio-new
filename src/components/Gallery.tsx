'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { MapPin, Calendar, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// --- Types -------------------------------------------------------------------

export interface GalleryImage {
    id: string;
    src: string;
    location: string | null;
    date: string;
    camera: string | null;
    iso: number | null;
    caption: string;
    width: number;
    height: number;
}

interface GalleryProps {
    images: GalleryImage[];
}

// --- Helpers -----------------------------------------------------------------

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// --- NavButton ---------------------------------------------------------------

function NavButton({
    direction,
    onClick,
    disabled,
    className = '',
}: {
    direction: 'prev' | 'next';
    onClick: () => void;
    disabled: boolean;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={direction === 'prev' ? 'Previous photo' : 'Next photo'}
            className={`
                shrink-0 flex items-center justify-center
                p-2.5 rounded-full
                bg-white/10 border border-white/15 text-white
                backdrop-blur-sm
                transition-all duration-200
                hover:bg-white/20 hover:scale-110
                active:scale-95
                disabled:opacity-20 disabled:pointer-events-none
                cursor-pointer
                ${className}
            `}
        >
            {direction === 'prev'
                ? <ChevronLeft className="w-5 h-5" />
                : <ChevronRight className="w-5 h-5" />
            }
        </button>
    );
}

// --- Lightbox ----------------------------------------------------------------

// --- LightboxSkeleton -------------------------------------------------------

function LightboxSkeleton({ visible }: { visible: boolean }) {
    return (
        <div
            aria-hidden="true"
            className={`absolute inset-0 z-10 rounded-2xl transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            style={{
                background: 'linear-gradient(110deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
                backgroundSize: '200% 100%',
                animation: visible ? 'skeleton-shimmer 2.5s infinite linear' : 'none',
            }}
        />
    );
}

// --- Lightbox ----------------------------------------------------------------

function Lightbox({
    image,
    images,
    onClose,
    onNavigate,
}: {
    image: GalleryImage;
    images: GalleryImage[];
    onClose: () => void;
    onNavigate: (next: GalleryImage) => void;
}) {
    const [lightboxLoaded, setLightboxLoaded] = useState(false);
    const currentIndex = images.findIndex((img) => img.id === image.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < images.length - 1;

    const goNext = useCallback(() => {
        if (hasNext) onNavigate(images[currentIndex + 1]);
    }, [hasNext, currentIndex, images, onNavigate]);

    const goPrev = useCallback(() => {
        if (hasPrev) onNavigate(images[currentIndex - 1]);
    }, [hasPrev, currentIndex, images, onNavigate]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose, goNext, goPrev]);




    // Compute image dimensions: capped at 70vh, preserving native aspect ratio.
    // width = min(available_width, 70vh * aspectRatio)
    const aspectRatio = image.width / image.height;

    return (
        <motion.div
            key="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            style={{
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(0,0,0,0.65)',
            }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
        >
            {/*
             * Content wrapper: width = clamp(300px, 70vh × ratio, 100%).
             * This makes the wrapper match the rendered image width exactly:
             *   - Portrait 450×800: ~354px wide (70vh×0.5625)
             *   - Landscape 1200×900: fills available width up to 100%
             * Metadata and controls are children, so they naturally align
             * with the image edges without any extra w-full juggling.
             */}
            <div
                className="flex flex-col items-center gap-4"
                style={{
                    width: `clamp(300px, calc(70vh * ${aspectRatio}), 100%)`,
                    maxWidth: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image: w-full fills the wrapper, height derived from aspect-ratio, capped at 70vh */}
                <motion.div
                    layoutId={`gallery-image-${image.id}`}
                    className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        maxHeight: '70vh',
                        aspectRatio: `${image.width} / ${image.height}`,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 38 }}
                >
                    {/* Skeleton shimmer for lightbox */}
                    <LightboxSkeleton visible={!lightboxLoaded} />
                    <Image
                        unoptimized
                        src={`${image.src}`}
                        alt={image.caption || image.location || image.id}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className={`object-cover transition-opacity duration-500 ${lightboxLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        priority
                        onLoad={() => setLightboxLoaded(true)}
                    />
                </motion.div>

                {/* Metadata — naturally as wide as the image above */}
                <motion.div
                    key={`meta-${image.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="w-full flex flex-col gap-1.5"
                >
                    {image.caption && (
                        <p className="text-white/90 text-base sm:text-lg font-bold leading-snug tracking-wide">
                            {image.caption}
                        </p>
                    )}
                    {(image.camera || image.iso !== null) && (
                        <span className="inline-flex items-center gap-2 text-white/50 text-xs font-mono tracking-wide">
                            <Camera className="w-3.5 h-3.5 shrink-0" />
                            {image.camera && <span>{image.camera}</span>}
                            {image.iso !== null && (
                                <span className="text-white/35">·</span>
                            )}
                            {image.iso !== null && (
                                <span>ISO {image.iso}</span>
                            )}
                        </span>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                            {image.location && (
                                <span className="flex items-center gap-1.5 text-white/65 text-sm">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 text-white/65" />
                                    {image.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-white/65 text-sm">
                                <Calendar className="w-3.5 h-3.5 shrink-0 text-white/65" />
                                {formatDate(image.date)}
                            </span>
                        </div>
                        <span className="text-white/65 text-xs tabular-nums">
                            {currentIndex + 1} / {images.length}
                        </span>
                    </div>
                </motion.div>

                {/* Controls: [←] [✕] [→] */}
                <div className="flex items-center gap-3">
                    <NavButton direction="prev" onClick={goPrev} disabled={!hasPrev} />

                    <button
                        onClick={onClose}
                        aria-label="Close lightbox"
                        className="flex items-center justify-center p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <NavButton direction="next" onClick={goNext} disabled={!hasNext} />
                </div>
            </div>
        </motion.div>
    );
}

// --- GalleryCard -------------------------------------------------------------

function GalleryCard({
    image,
    index,
    onClick,
}: {
    image: GalleryImage;
    index: number;
    onClick: () => void;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <motion.article
            id={`thumb-${image.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="group relative cursor-pointer rounded-xl overflow-hidden"
            onClick={onClick}
            aria-label={image.caption || image.location || `Photo ${index + 1}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick();
            }}
        >
            {/* Grid thumbnails are always 4:3 for visual consistency */}
            <motion.div
                layoutId={`gallery-image-${image.id}`}
                className="relative w-full aspect-4/3 overflow-hidden rounded-xl"
                transition={{ type: 'spring', stiffness: 350, damping: 38 }}
            >
                {/* Skeleton shimmer — visible until image loads */}
                <div
                    aria-hidden="true"
                    className={`absolute inset-0 z-10 bg-white/5 animate-pulse transition-opacity duration-500 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}
                    style={{
                        background: 'linear-gradient(110deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)',
                        backgroundSize: '200% 100%',
                        animation: loaded ? 'none' : 'skeleton-shimmer 1.5s infinite linear',
                    }}
                />

                <Image
                    src={image.src}
                    alt={image.caption || image.location || `Photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-all duration-500 ease-out group-hover:scale-[1.06] ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                        }`}
                    quality={75}
                    onLoad={() => setLoaded(true)}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {image.location && (
                    <div className="absolute bottom-3 left-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <span className="inline-flex items-center gap-1 text-white/90 text-xs font-medium">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {image.location}
                        </span>
                    </div>
                )}
            </motion.div>
        </motion.article>
    );
}

// --- Gallery (root) ----------------------------------------------------------

export default function Gallery({ images }: GalleryProps) {
    const [shuffled, setShuffled] = useState<GalleryImage[]>(images);
    useEffect(() => {
        setShuffled(shuffle(images));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Lock body scroll whenever lightbox is open.
    // Keeping this in the parent (not inside Lightbox) prevents the brief
    // unlock/relock that happens when Lightbox remounts on navigation.
    useEffect(() => {
        if (!selectedId) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [selectedId !== null]); // re-run only when open/close state changes, not on image switch

    const selectedImage = useMemo(
        () => shuffled.find((img) => img.id === selectedId) ?? null,
        [selectedId, shuffled],
    );

    const open = useCallback((img: GalleryImage) => {
        setSelectedId(img.id);
        trackEvent('gallery-photo', img.id, {
            caption: img.caption,
            location: img.location,
        });
    }, []);
    const close = useCallback(() => setSelectedId(null), []);
    const handleNavigate = useCallback((next: GalleryImage) => setSelectedId(next.id), []);

    return (
        <LayoutGroup>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {shuffled.map((image, index) => (
                    <GalleryCard
                        key={image.id}
                        image={image}
                        index={index}
                        onClick={() => open(image)}
                    />
                ))}
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        key={selectedImage.id}
                        image={selectedImage}
                        images={shuffled}
                        onClose={close}
                        onNavigate={handleNavigate}
                    />
                )}
            </AnimatePresence>
        </LayoutGroup>
    );
}