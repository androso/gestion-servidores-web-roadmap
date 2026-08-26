export function isPdfUrl(url: string): boolean {
  const path = url.split('#')[0].split('?')[0];
  const pathname = path.startsWith('/') ? path : safeUrlPathname(path);
  return pathname.toLowerCase().endsWith('.pdf');
}

export function pageFromLocator(locator: string): number | null {
  const pageMatch = locator.match(/\bpp?\.?\s*(\d+)/i);
  if (pageMatch) {
    return Number(pageMatch[1]);
  }
  const slideMatch = locator.match(/\bdiapositiva\s+(\d+)/i);
  if (slideMatch) {
    return Number(slideMatch[1]);
  }
  return null;
}

export function pdfViewUrl(url: string, locator?: string): string {
  const base = url.split('#')[0];
  if (!locator) {
    return url;
  }
  const page = pageFromLocator(locator);
  if (page && page > 0) {
    return `${base}#page=${page}`;
  }
  return url;
}

function safeUrlPathname(value: string): string {
  try {
    return new URL(value, 'https://roadmap.local').pathname;
  } catch {
    return value;
  }
}
