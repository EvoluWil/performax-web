function quoteCsvValue(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseCsvContent(content: string): string[][] {
  const normalized = content.replace(/^\uFEFF/, '').trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && normalized[i + 1] === '\n') {
        i++;
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  return lines.map(parseCsvLine);
}

export function generateCsvTemplate(
  headers: string[],
  exampleRow?: string[],
): string {
  const rows = [headers.map(quoteCsvValue).join(',')];

  if (exampleRow?.length) {
    rows.push(exampleRow.map(quoteCsvValue).join(','));
  }

  return rows.join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob(['\ufeff' + content], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
