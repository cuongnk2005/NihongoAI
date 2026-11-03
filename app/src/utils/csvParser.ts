/**
 * RFC-4180 compliant CSV / TSV parser for Anki-compatible flashcard imports.
 * Preserves UTF-8 Japanese (Kanji, Kana) and Vietnamese diacritics,
 * strips UTF-8 BOM, handles quoted fields, escaped quotes (""), and multiline cells.
 */

export type CsvDelimiter = 'auto' | ',' | '\t' | ';';

export interface CsvParseResult {
  rows: string[][];
  detectedDelimiter: ',' | '\t' | ';';
  maxColumns: number;
  skippedCommentLines: number;
}

/**
 * Automatically detects the most likely delimiter from the first non-comment line.
 */
export function detectDelimiter(text: string): ',' | '\t' | ';' {
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check Anki directive header e.g. #separator:tab, #separator:comma, #separator:semicolon
    if (trimmed.startsWith('#separator:')) {
      const sepVal = trimmed.slice('#separator:'.length).trim().toLowerCase();
      if (sepVal === 'tab' || sepVal === '\\t') return '\t';
      if (sepVal === 'semicolon' || sepVal === ';') return ';';
      if (sepVal === 'comma' || sepVal === ',') return ',';
    }
    if (trimmed.startsWith('#')) continue;

    // Count delimiters outside quotes on the first data line
    let inQuotes = false;
    let tabCount = 0;
    let commaCount = 0;
    let semiCount = 0;

    for (let i = 0; i < rawLine.length; i++) {
      const ch = rawLine[i];
      if (ch === '"') {
        if (inQuotes && rawLine[i + 1] === '"') {
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes) {
        if (ch === '\t') tabCount++;
        else if (ch === ',') commaCount++;
        else if (ch === ';') semiCount++;
      }
    }

    if (tabCount > commaCount && tabCount >= semiCount && tabCount > 0) return '\t';
    if (semiCount > commaCount && semiCount > tabCount && semiCount > 0) return ';';
    return ',';
  }

  return ',';
}

/**
 * Parses CSV/TSV content according to RFC-4180 without naive string splitting.
 */
export function parseAnkiCsv(rawText: string, delimiterOption: CsvDelimiter = 'auto'): CsvParseResult {
  // Strip UTF-8 BOM if present
  const content = rawText.replace(/^\uFEFF/, '');
  const actualDelimiter: ',' | '\t' | ';' =
    delimiterOption === 'auto' ? detectDelimiter(content) : delimiterOption;

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let skippedCommentLines = 0;

  let i = 0;
  const len = content.length;

  while (i < len) {
    // At the start of a new row (not inside quotes), check if line is an Anki # comment
    if (!inQuotes && currentRow.length === 0 && currentCell.length === 0) {
      if (content[i] === '#') {
        skippedCommentLines++;
        while (i < len && content[i] !== '\n') {
          i++;
        }
        if (i < len && content[i] === '\n') i++;
        continue;
      }
    }

    const ch = content[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < len && content[i + 1] === '"') {
          // Escaped quote ""
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"' && currentCell.trim().length === 0) {
        currentCell = '';
        inQuotes = true;
        i++;
        continue;
      }

      if (ch === actualDelimiter) {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      if (ch === '\r' || ch === '\n') {
        if (ch === '\r' && i + 1 < len && content[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = '';

        // Only push row if it has at least one non-empty cell
        if (currentRow.some((cell) => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      }

      currentCell += ch;
      i++;
    }
  }

  // Flush last cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  const maxColumns = rows.reduce((max, r) => Math.max(max, r.length), 0);

  return {
    rows,
    detectedDelimiter: actualDelimiter,
    maxColumns,
    skippedCommentLines
  };
}

