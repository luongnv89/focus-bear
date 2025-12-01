import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { navigationContent } from '../data/navigation';

function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Auto-hide header on scroll down (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
          setIsMobileMenuOpen(false); // Close menu when hiding
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle smooth scroll for anchor links
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ height: 'var(--header-height)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <nav
          className="flex items-center justify-between h-full"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-accent transition-colors"
            aria-label="FocusBear home"
          >
            <Zap className="w-6 h-6 text-accent" aria-hidden="true" />
            <span>{navigationContent.logo.text}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationContent.links.map((link) =>
              link.external ? (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ) : link.href.startsWith('#') ? (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.id}
                  to={link.href}
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}

            {/* CTA Button */}
            <a
              href={navigationContent.ctaButton.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
              aria-label={navigationContent.ctaButton.ariaLabel}
            >
              {navigationContent.ctaButton.text}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-accent transition-colors"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full left-0 right-0 bg-dark-bg border-b border-dark-border transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="px-4 py-4 space-y-3">
          {navigationContent.links.map((link) =>
            link.external ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-gray-300 hover:text-accent transition-colors"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                {link.label}
              </a>
            ) : link.href.startsWith('#') ? (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block py-2 text-gray-300 hover:text-accent transition-colors"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                to={link.href}
                className="block py-2 text-gray-300 hover:text-accent transition-colors"
                tabIndex={isMobileMenuOpen ? 0 : -1}
              >
                {link.label}
              </Link>
            )
          )}

          {/* Mobile CTA */}
          <a
            href={navigationContent.ctaButton.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center mt-4"
            aria-label={navigationContent.ctaButton.ariaLabel}
            tabIndex={isMobileMenuOpen ? 0 : -1}
          >
            {navigationContent.ctaButton.text}
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
