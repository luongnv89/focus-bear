import { useState, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { screenshotGalleryContent } from '../data/screenshots';

function Screenshots() {
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const openLightbox = useCallback((index) => {
    setPhotoIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Prepare slides for lightbox
  const slides = screenshotGalleryContent.screenshots.map((screenshot) => ({
    src: screenshot.src,
    alt: screenshot.alt,
    title: screenshot.caption,
  }));

  return (
    <section id="screenshots" className="py-16 sm:py-24 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {screenshotGalleryContent.sectionTitle}
          </h2>
          <p className="text-gray-400 text-lg">
            {screenshotGalleryContent.sectionDescription}
          </p>
        </div>

        {/* Screenshot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshotGalleryContent.screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-xl border border-dark-border hover:border-accent/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-bg"
              aria-label={`View ${screenshot.caption} in full size`}
            >
              {/* Thumbnail Image */}
              <div className="aspect-video relative">
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-dark-bg/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-accent/20 px-4 py-2 rounded-lg border border-accent/30">
                    Click to enlarge
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 bg-dark-card">
                <p className="text-gray-300 text-sm font-medium">
                  {screenshot.caption}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox */}
        <Lightbox
          open={isOpen}
          close={closeLightbox}
          index={photoIndex}
          slides={slides}
          controller={{ aria: true }}
          carousel={{ finite: false }}
          render={{
            buttonPrev: slides.length <= 1 ? () => null : undefined,
            buttonNext: slides.length <= 1 ? () => null : undefined,
          }}
          styles={{
            container: { backgroundColor: 'rgba(6, 6, 6, 0.95)' },
          }}
        />
      </div>
    </section>
  );
}

export default Screenshots;
