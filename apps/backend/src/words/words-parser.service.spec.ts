import { WordsParserService } from './words-parser.service';

describe('WordsParserService', () => {
  let parser: WordsParserService;

  beforeEach(() => {
    parser = new WordsParserService();
  });

  it('should be defined', () => {
    expect(parser).toBeDefined();
  });

  describe('parseText', () => {
    it('should parse valid lines with various separators (—, -, :, ;, Tab)', () => {
      const inputText = `
destination — місце призначення
luggage - багаж
departure: відправлення
arrival; прибуття
flight	рейс
      `;

      const result = parser.parseText(inputText);

      expect(result.valid.length).toBe(5);
      expect(result.invalid.length).toBe(0);
      expect(result.duplicates.length).toBe(0);

      expect(result.valid[0]).toEqual({
        term: 'destination',
        translation: 'місце призначення',
        note: undefined,
      });
      expect(result.valid[1]).toEqual({
        term: 'luggage',
        translation: 'багаж',
        note: undefined,
      });
      expect(result.valid[4]).toEqual({
        term: 'flight',
        translation: 'рейс',
        note: undefined,
      });
    });

    it('should catch invalid lines without separators', () => {
      const inputText = `
destination — місце призначення
invalid line without separator
luggage - багаж
      `;

      const result = parser.parseText(inputText);

      expect(result.valid.length).toBe(2);
      expect(result.invalid.length).toBe(1);
      expect(result.invalid[0].line).toBe(3);
      expect(result.invalid[0].value).toBe('invalid line without separator');
    });

    it('should detect duplicate terms within input text', () => {
      const inputText = `
destination — місце призначення
destination - інше призначення
      `;

      const result = parser.parseText(inputText);

      expect(result.valid.length).toBe(1);
      expect(result.duplicates.length).toBe(1);
      expect(result.duplicates[0].term).toBe('destination');
    });

    it('should detect duplicate terms against existing set terms', () => {
      const inputText = `destination — місце призначення`;
      const existingInSet = ['destination'];

      const result = parser.parseText(inputText, existingInSet);

      expect(result.valid.length).toBe(0);
      expect(result.duplicates.length).toBe(1);
      expect(result.duplicates[0].reason).toContain('already exists in this set');
    });
  });
});
