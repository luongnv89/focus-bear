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

  test('subdomain containing keyword still matches (real second-level)', () => {
    expect(categorizeDomain('m.facebook.com').key).toBe('social');
    expect(categorizeDomain('music.youtube.com').key).toBe('entertainment');
    expect(categorizeDomain('api.github.com').key).toBe('development');
    expect(categorizeDomain('shop.target.com').key).toBe('shopping');
  });

  // F-BUG-010: substring `includes` matching over-matched. The new matcher
  // requires the keyword to be the registered second-level domain (or a
  // multi-label suffix), so arbitrary first-label matches like
  // `target.example.net` and `news.example.com` are NOT categorized.
  test('first-label substring does not match (F-BUG-010)', () => {
    expect(categorizeDomain('target.example.net').key).toBe('other');
    expect(categorizeDomain('news.example.com').key).toBe('other');
    expect(categorizeDomain('github.mycompany.io').key).toBe('other');
    expect(categorizeDomain('amazon.evil.test').key).toBe('other');
  });

  // Per acceptance: at least one false-positive case per keyword list.
  // Each list contains a keyword that has a common substring trap; we
  // exercise a non-keyword domain that previously matched.
  test('false-positive coverage per category (F-BUG-010)', () => {
    // social
    expect(categorizeDomain('facebook-login.example.com').key).toBe('other');
    // entertainment
    expect(categorizeDomain('netflixcdn.example.net').key).toBe('other');
    // productivity
    expect(categorizeDomain('slackbot.example.com').key).toBe('other');
    // development
    expect(categorizeDomain('githubclone.example.io').key).toBe('other');
    // news
    expect(categorizeDomain('newsdaily.example.org').key).toBe('other');
    // shopping
    expect(categorizeDomain('target.example.net').key).toBe('other');
  });

  test('multi-label keywords still match their full domain', () => {
    // x.com
    expect(categorizeDomain('x.com').key).toBe('social');
    // dev.to
    expect(categorizeDomain('dev.to').key).toBe('development');
    // docs.google / drive.google / meet.google (productivity multi-labels)
    expect(categorizeDomain('docs.google.com').key).toBe('productivity');
    expect(categorizeDomain('drive.google.com').key).toBe('productivity');
    expect(categorizeDomain('meet.google.com').key).toBe('productivity');
  });

  test('multi-label keyword does not match a label that merely contains it', () => {
    // `meet.google` must not match `meet.googleology.com`
    expect(categorizeDomain('meet.googleology.com').key).toBe('other');
    // `x.com` must not match `x.company.com`
    expect(categorizeDomain('x.company.com').key).toBe('other');
  });

  test('news keyword: real news sites still match', () => {
    expect(categorizeDomain('cnn.com').key).toBe('news');
    expect(categorizeDomain('www.nytimes.com').key).toBe('news');
    // "Nuanced" case from the issue: a subdomain `news.<x>` where the
    // second-level is not a registered news keyword is NOT classified
    // as news (avoids the dev-URL false positive).
    expect(categorizeDomain('news.example.com').key).toBe('other');
  });
});
