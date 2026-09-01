import Hero from '../components/Hero';
import Features from '../components/Features';
import Screenshots from '../components/Screenshots';
import { Globe } from 'lucide-react';
import { heroContent } from '../data/hero';

function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <Screenshots />

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 bg-dark-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Take Control of Your Focus?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who have improved their productivity with
            FocusBear. It&apos;s free, private, and takes seconds to install.
          </p>
          <a
            href={heroContent.ctaButton.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
            aria-label={heroContent.ctaButton.ariaLabel}
          >
            <Globe className="w-6 h-6" aria-hidden="true" />
            Get FocusBear Now
          </a>
        </div>
      </section>
    </>
  );
}

export default Landing;
