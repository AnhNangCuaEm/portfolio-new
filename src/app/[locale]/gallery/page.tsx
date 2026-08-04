import Gallery, { GalleryImage } from '@/components/Gallery';
import galleryData from '../../../../public/gallery-meta.json';

export default function GalleryPage() {
    return (
        <main className="w-full pt-24 pb-4 sm:pt-32 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <Gallery images={galleryData as GalleryImage[]} />
            </div>
        </main>
    );
}
