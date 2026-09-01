import { Link } from 'react-router-dom';
import { Code, Zap, Heart } from 'lucide-react';
import { footerContent } from '../data/footer';

function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-accent transition-colors"
            >
              <Zap className="w-6 h-6 text-accent" aria-hidden="true" />
              <span>FocusPaw</span>
            </Link>
            <p className="text-gray-400 text-sm">{footerContent.tagline}</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-6" aria-label="Footer navigation">
            {footerContent.links.map((link) =>
              link.external ? (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors"
                  aria-label={link.ariaLabel}
                >
                  {link.id === 'github' && (
                    <Code className="w-4 h-4" aria-hidden="true" />
                  )}
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.id}
                  to={link.href}
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-dark-border mt-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-500 text-sm">{footerContent.copyright}</p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with{' '}
              <Heart
                className="w-4 h-4 text-danger inline"
                aria-hidden="true"
              />{' '}
              for focus seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
