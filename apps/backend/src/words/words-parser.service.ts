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

      // Find separator according to strict priority
      const separatorMatch = this.findSeparator(trimmedLine);

      if (!separatorMatch) {
        invalid.push({
          line: lineNumber,
          value: trimmedLine,
          reason: 'Separator not found (expected —, –, -, :, ; or Tab)',
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
    // List of separators ordered by strict preference:
    // 1. Tab
    // 2. Em-dash (—)
    // 3. En-dash (–)
    // 4. Colon (:)
    // 5. Semicolon (;)
    // 6. Hyphen surrounded by spaces (" - ")
    const preferredSeparators = ['\t', '—', '–', ':', ';', ' - '];

    for (const sep of preferredSeparators) {
      if (line.includes(sep)) {
        const parts = line.split(sep);
        const term = parts[0].trim();
        const translation = parts[1] ? parts[1].trim() : '';
        const rest = parts.length > 2 ? parts.slice(2).join(sep).trim() : undefined;
        return { term, translation, rest };
      }
    }

    // Fallback: find a hyphen surrounded by whitespace with a linear scan.
    // Avoid a backtracking regex here because this value comes from user input.
    for (let index = 1; index < line.length - 1; index += 1) {
      if (
        line[index] === '-' &&
        line[index - 1].trim() === '' &&
        line[index + 1].trim() === ''
      ) {
        return {
          term: line.slice(0, index).trim(),
          translation: line.slice(index + 1).trim(),
        };
      }
    }

    return null;
  }
}
