import { describe, expect, it } from 'vitest';
import { FEEDBACK_MESSAGE_MAX, FEEDBACK_PER_WINDOW, FEEDBACK_WINDOW_MS, feedbackAllowed, parseFeedback, sameSecret } from './feedback';

describe('feedback', () => {
  it('accepts a valid message and keeps line breaks', () => {
    const f = parseFeedback(JSON.stringify({ kind: 'problem', message: '  Card stuck\nafter Kot  ', contact: 'a@b.c', meta: { lang: 'ne' } }));
    expect(f).toEqual({ kind: 'problem', message: 'Card stuck\nafter Kot', contact: 'a@b.c', meta: { lang: 'ne' } });
  });

  it('rejects unknown kinds, empty messages and junk', () => {
    expect(parseFeedback(JSON.stringify({ kind: 'spam', message: 'hi' }))).toBeNull();
    expect(parseFeedback(JSON.stringify({ kind: 'thanks', message: '   ' }))).toBeNull();
    expect(parseFeedback('not json')).toBeNull();
    expect(parseFeedback('[1,2]')).toBeNull();
  });

  it('limits lengths, drops unknown meta fields and control characters', () => {
    const f = parseFeedback(
      JSON.stringify({ kind: 'idea', message: 'x'.repeat(5000), contact: 'c'.repeat(500), meta: { lang: 'en\u0000', evil: 'y' } }),
    )!;
    expect(f.message).toHaveLength(FEEDBACK_MESSAGE_MAX);
    expect(f.contact.length).toBeLessThanOrEqual(100);
    expect(f.meta).toEqual({ lang: 'en' });
  });

  it('rate-limits each network', () => {
    const now = 1_000_000;
    const recent = Array.from({ length: FEEDBACK_PER_WINDOW }, (_, i) => now - i * 1000);
    expect(feedbackAllowed(recent, now)).toBe(false);
    expect(feedbackAllowed(recent, now + FEEDBACK_WINDOW_MS + 1)).toBe(true);
    expect(feedbackAllowed([], now)).toBe(true);
  });

  it('compares the admin key safely', () => {
    expect(sameSecret('abc', 'abc')).toBe(true);
    expect(sameSecret('abc', 'abd')).toBe(false);
    expect(sameSecret('abc', 'abcd')).toBe(false);
    expect(sameSecret('', 'x')).toBe(false);
  });
});
