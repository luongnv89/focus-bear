import { categorizeDomain, CATEGORY_PALETTE, CATEGORY_CONFIG } from '../src/common/categories.js';

describe('categories', () => {
  test('categorizes social domains', () => {
    expect(categorizeDomain('facebook.com').key).toBe('social');
    expect(categorizeDomain('twitter.com').key).toBe('social');
    expect(categorizeDomain('reddit.com').key).toBe('social');
    expect(categorizeDomain('discord.gg').key).toBe('social');
  });

  test('categorizes entertainment domains', () => {
    expect(categorizeDomain('youtube.com').key).toBe('entertainment');
    expect(categorizeDomain('twitch.tv').key).toBe('entertainment');
    expect(categorizeDomain('spotify.com').key).toBe('entertainment');
  });

  test('categorizes productivity domains', () => {
    expect(categorizeDomain('slack.com').key).toBe('productivity');
    expect(categorizeDomain('notion.so').key).toBe('productivity');
    expect(categorizeDomain('docs.google.com').key).toBe('productivity');
  });

  test('categorizes development domains', () => {
    expect(categorizeDomain('github.com').key).toBe('development');
    expect(categorizeDomain('stackoverflow.com').key).toBe('development');
  });

  test('categorizes news domains', () => {
    expect(categorizeDomain('cnn.com').key).toBe('news');
    expect(categorizeDomain('nytimes.com').key).toBe('news');
  });

  test('categorizes shopping domains', () => {
    expect(categorizeDomain('amazon.com').key).toBe('shopping');
    expect(categorizeDomain('ebay.com').key).toBe('shopping');
  });

  test('returns other for unknown domains', () => {
    const result = categorizeDomain('example.com');
    expect(result.key).toBe('other');
    expect(result.name).toBe('Other');
    expect(result.sentiment).toBe('neutral');
    expect(result.color).toBe(CATEGORY_PALETTE.other);
  });

  test('matching is case-insensitive', () => {
    expect(categorizeDomain('GitHub.com').key).toBe('development');
    expect(categorizeDomain('YOUTUBE.COM').key).toBe('entertainment');
    expect(categorizeDomain('FACEBOOK.COM').key).toBe('social');
  });

  test('returns correct shape with name, color, sentiment', () => {
    const result = categorizeDomain('github.com');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('key');
    expect(result).toHaveProperty('sentiment');
    expect(result.name).toBe(CATEGORY_CONFIG.development.name);
    expect(result.color).toBe(CATEGORY_CONFIG.development.color);
  });

  test('palette and config are consistent', () => {
    Object.entries(CATEGORY_CONFIG).forEach(([key, cfg]) => {
      expect(CATEGORY_PALETTE[key]).toBe(cfg.color);
    });
  });

  test('subdomain containing keyword still matches', () => {
    expect(categorizeDomain('m.facebook.com').key).toBe('social');
    expect(categorizeDomain('music.youtube.com').key).toBe('entertainment');
  });

  test('false-positive substring is currently categorized (documents current behavior)', () => {
    // e.g., a domain containing 'news' substring matches news category by design
    expect(categorizeDomain('newsagency.com').key).toBe('news');
    // an unrelated domain with no keyword falls to other
    expect(categorizeDomain('myawesomesite.io').key).toBe('other');
  });
});
