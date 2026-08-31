import { Chrome } from 'lucide-react';
import { heroContent } from '../data/hero';

function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-dark-bg to-dark-card" />

      {/* Accent glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in">
            <span className="text-white">
              {heroContent.headline.split(',')[0]},
            </span>
            <br />
            <span className="text-accent">
              {heroContent.headline.split(',')[1]?.trim()}
            </span>
          </h1>

          {/* Tagline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto animate-slide-up">
            {heroContent.tagline}
          </p>

          {/* CTA Button */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <a
              href={heroContent.ctaButton.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
              aria-label={heroContent.ctaButton.ariaLabel}
            >
              <Chrome className="w-6 h-6" aria-hidden="true" />
              {heroContent.ctaButton.text}
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              100% Free
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              No Account Required
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              Open Source
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 sm:mt-20 relative">
          <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-accent/10 border border-dark-border">
            <img
              src={heroContent.heroImage.src}
              alt={heroContent.heroImage.alt}
              width={heroContent.heroImage.width}
              height={heroContent.heroImage.height}
              className="w-full h-auto"
              loading="eager"
              decoding="async"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
