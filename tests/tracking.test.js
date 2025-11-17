/**
 * Tests for tracking module
 * Tests URL parsing and focus-switch tracking logic
 */

import { parseUrl } from '../src/background/tracking.js';

describe('Tracking Module', () => {
  describe('parseUrl', () => {
    test('parses valid HTTP URL correctly', () => {
      const result = parseUrl('http://example.com/path/to/page');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/path/to/page',
      });
    });

    test('parses valid HTTPS URL correctly', () => {
      const result = parseUrl('https://example.com/path/to/page');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/path/to/page',
      });
    });

    test('removes www. prefix from domain', () => {
      const result = parseUrl('https://www.example.com/page');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/page',
      });
    });

    test('handles URLs without subpath', () => {
      const result = parseUrl('https://example.com');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/',
      });
    });

    test('handles URLs with query parameters', () => {
      const result = parseUrl('https://example.com/search?q=test&lang=en');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/search',
      });
    });

    test('handles URLs with hash fragments', () => {
      const result = parseUrl('https://example.com/page#section');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/page',
      });
    });

    test('handles URLs with both query and hash', () => {
      const result = parseUrl('https://example.com/page?id=123#top');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/page',
      });
    });

    test('handles Reddit-style subpaths', () => {
      const result = parseUrl('https://reddit.com/r/programming/comments/abc123');
      expect(result).toEqual({
        domain: 'reddit.com',
        subpath: '/r/programming/comments/abc123',
      });
    });

    test('handles GitHub-style subpaths', () => {
      const result = parseUrl('https://github.com/user/repo/issues/42');
      expect(result).toEqual({
        domain: 'github.com',
        subpath: '/user/repo/issues/42',
      });
    });

    test('returns null for non-HTTP URLs', () => {
      expect(parseUrl('chrome://extensions/')).toBeNull();
      expect(parseUrl('about:blank')).toBeNull();
      expect(parseUrl('file:///path/to/file.html')).toBeNull();
      expect(parseUrl('ftp://example.com')).toBeNull();
    });

    test('returns null for null or undefined URL', () => {
      expect(parseUrl(null)).toBeNull();
      expect(parseUrl(undefined)).toBeNull();
    });

    test('returns null for empty string', () => {
      expect(parseUrl('')).toBeNull();
    });

    test('handles URLs with ports', () => {
      const result = parseUrl('https://localhost:3000/app');
      expect(result).toEqual({
        domain: 'localhost',
        subpath: '/app',
      });
    });

    test('handles URLs with subdomains', () => {
      const result = parseUrl('https://mail.google.com/mail/u/0/');
      expect(result).toEqual({
        domain: 'mail.google.com',
        subpath: '/mail/u/0/',
      });
    });

    test('handles URLs with international domains', () => {
      const result = parseUrl('https://münchen.de/page');
      expect(result).toEqual({
        domain: 'xn--mnchen-3ya.de',
        subpath: '/page',
      });
    });

    test('handles complex YouTube URLs', () => {
      const result = parseUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({
        domain: 'youtube.com',
        subpath: '/watch',
      });
    });

    test('handles trailing slashes consistently', () => {
      const result1 = parseUrl('https://example.com/page');
      const result2 = parseUrl('https://example.com/page/');
      expect(result1.subpath).toBe('/page');
      expect(result2.subpath).toBe('/page/');
    });

    test('returns null for malformed URLs', () => {
      expect(parseUrl('not a url')).toBeNull();
      expect(parseUrl('http://')).toBeNull();
      expect(parseUrl('https://')).toBeNull();
    });

    test('handles URLs with authentication', () => {
      const result = parseUrl('https://user:pass@example.com/secure');
      expect(result).toEqual({
        domain: 'example.com',
        subpath: '/secure',
      });
    });

    test('handles IP addresses', () => {
      const result = parseUrl('https://192.168.1.1/admin');
      expect(result).toEqual({
        domain: '192.168.1.1',
        subpath: '/admin',
      });
    });

    test('handles IPv6 addresses', () => {
      const result = parseUrl('https://[2001:db8::1]/page');
      expect(result).toEqual({
        domain: '[2001:db8::1]',
        subpath: '/page',
      });
    });
  });
});
