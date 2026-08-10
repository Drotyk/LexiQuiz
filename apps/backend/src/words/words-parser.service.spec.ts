import { WordsParserService } from './words-parser.service';

describe('WordsParserService', () => {
  let parser: WordsParserService;

  beforeEach(() => {
    parser = new WordsParserService();
  });

  it('should parse simple term and translation with dash', () => {
    const text = 'destination — місце призначення';
    const result = parser.parseText(text);

    expect(result.valid.length).toBe(1);
    expect(result.valid[0].term).toBe('destination');
    expect(result.valid[0].translation).toBe('місце призначення');
  });

  it('should parse compound hyphenated words correctly without breaking term', () => {
    const text = `
well-being - добробут
mother-in-law — свекруха
state-of-the-art: найсучасніший
word\ttranslation
    `.trim();

    const result = parser.parseText(text);

    expect(result.valid.length).toBe(4);
    expect(result.valid[0]).toEqual({
      term: 'well-being',
      translation: 'добробут',
      note: undefined,
    });
    expect(result.valid[1]).toEqual({
      term: 'mother-in-law',
      translation: 'свекруха',
      note: undefined,
    });
    expect(result.valid[2]).toEqual({
      term: 'state-of-the-art',
      translation: 'найсучасніший',
      note: undefined,
    });
    expect(result.valid[3]).toEqual({
      term: 'word',
      translation: 'translation',
      note: undefined,
    });
  });

  it('should detect duplicate terms within input and existing set', () => {
    const text = `
hello — привіт
hello — вітання
    `.trim();

    const result = parser.parseText(text, ['goodbye']);

    expect(result.valid.length).toBe(1);
    expect(result.duplicates.length).toBe(1);
    expect(result.duplicates[0].term).toBe('hello');
  });

  it('should parse whitespace-separated hyphens without regex backtracking', () => {
    const result = parser.parseText(`term\u00a0-\u00a0translation`);

    expect(result.valid).toEqual([
      {
        term: 'term',
        translation: 'translation',
        note: undefined,
      },
    ]);
  });
});
