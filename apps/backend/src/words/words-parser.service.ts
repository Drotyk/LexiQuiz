import { Injectable } from '@nestjs/common';
import {
  BulkPreviewResultDto,
  BulkPreviewValidItem,
  BulkPreviewInvalidItem,
  BulkPreviewDuplicateItem,
} from '@wordforge/shared-types';

@Injectable()
export class WordsParserService {
  parseText(
    text: string,
    existingTermsInSet: string[] = [],
  ): BulkPreviewResultDto {
    const lines = text.split(/\r?\n/);
    const valid: BulkPreviewValidItem[] = [];
    const invalid: BulkPreviewInvalidItem[] = [];
    const duplicates: BulkPreviewDuplicateItem[] = [];

    const seenTermsInInput = new Set<string>();
    const existingSetTerms = new Set(
      existingTermsInSet.map((t) => t.trim().toLowerCase()),
    );

    lines.forEach((lineContent, index) => {
      const lineNumber = index + 1;
      const trimmedLine = lineContent.trim();

      // Rule 1: Ignore empty lines
      if (!trimmedLine) {
        return;
      }

      // Find separator: em-dash, hyphen, colon, semicolon, or tab
      const separatorMatch = this.findSeparator(trimmedLine);

      if (!separatorMatch) {
        invalid.push({
          line: lineNumber,
          value: trimmedLine,
          reason: 'Separator not found (expected —, -, :, ; or Tab)',
        });
        return;
      }

      const { term, translation, rest } = separatorMatch;

      if (!term || !translation) {
        invalid.push({
          line: lineNumber,
          value: trimmedLine,
          reason: 'Missing term or translation',
        });
        return;
      }

      const normalizedTerm = term.toLowerCase();

      // Check duplicates
      const isDuplicateInSet = existingSetTerms.has(normalizedTerm);
      const isDuplicateInInput = seenTermsInInput.has(normalizedTerm);

      if (isDuplicateInSet || isDuplicateInInput) {
        duplicates.push({
          line: lineNumber,
          term,
          translation,
          reason: isDuplicateInSet
            ? 'Word already exists in this set'
            : 'Duplicate word in input list',
        });
        return;
      }

      seenTermsInInput.add(normalizedTerm);

      valid.push({
        term,
        translation,
        note: rest || undefined,
      });
    });

    return {
      valid,
      invalid,
      duplicates,
    };
  }

  private findSeparator(line: string): {
    term: string;
    translation: string;
    rest?: string;
  } | null {
    // List of separators ordered by preference: tab, em-dash, colon, semicolon, hyphen
    const separators = ['\t', '—', ':', ';', ' - '];

    for (const sep of separators) {
      if (line.includes(sep)) {
        const parts = line.split(sep);
        const term = parts[0].trim();
        const translation = parts.slice(1).join(sep).trim();
        return { term, translation };
      }
    }

    // Fallback check for single hyphen if surrounded by spaces or standard hyphen
    const hyphenIdx = line.indexOf('-');
    if (hyphenIdx > 0 && hyphenIdx < line.length - 1) {
      const term = line.substring(0, hyphenIdx).trim();
      const translation = line.substring(hyphenIdx + 1).trim();
      return { term, translation };
    }

    return null;
  }
}
