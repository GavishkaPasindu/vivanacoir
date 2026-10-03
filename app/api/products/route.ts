import type { Product, ProductsApiResponse } from '@/app/lib/types';

const SHEET_ID = process.env.CATALOG_SHEET_ID || '1Rsw4gjO4jPFlHXofLMgOujn6FuhNWMonnepHOvCn4pE';
const SHEET_NAME = 'Sheet1';

// Convert a Google Drive file ID to a directly-embeddable image URL
export function driveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

// Extract Google Drive file ID from any Drive URL format
function extractFileId(imageValue: string): string {
  if (!imageValue) return '';

  const driveFilePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const ucPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
  const lhPattern = /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/;
  const shortPattern = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;

  let match;
  if ((match = imageValue.match(driveFilePattern))) return match[1];
  if ((match = imageValue.match(ucPattern))) return match[1];
  if ((match = imageValue.match(lhPattern))) return match[1];
  if ((match = imageValue.match(shortPattern))) return match[1];

  if (/^[a-zA-Z0-9_-]{25,60}$/.test(imageValue.trim())) return imageValue.trim();

  return '';
}

async function fetchSheetData(): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();

  const rows: string[][] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let inQuote = false;
    let cell = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cols.push(cell.trim());
        cell = '';
      } else if (ch !== '\r') {
        cell += ch;
      }
    }
    cols.push(cell.trim());
    rows.push(cols);
  }

  return rows;
}

function parseTags(tagValue: string): string[] {
  if (!tagValue) return [];
  return tagValue.split(',').map(t => t.trim()).filter(Boolean);
}

export async function GET(): Promise<Response> {
  try {
    const rows = await fetchSheetData();

    // Header: ITEMCODE, IMAGE, Title, ShortDesc, Description, Price, DiscountPrice, Category, Tag
    const products: Product[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 1 || !row[0]) continue;

      const [itemcode, image, sheetTitle, shortDesc, description, price, discountPrice, category, tag] = row;
      const fileId = extractFileId(image);
      const code = itemcode.toUpperCase().trim();
      const tags = parseTags(tag);

      if (code.startsWith('ID')) {
        const parsedPrice = parseFloat(price) || 0;
        const isActuallyWholesale = parsedPrice === 0;

        products.push({
          id: code,
          imageId: fileId,
          title: sheetTitle || description || `Product ${code}`,
          price: parsedPrice,
          category: category || '',
          tags: isActuallyWholesale && tags.length === 0 ? ['Wholesale'] : tags,
          shortDesc: shortDesc || '',
          description: description || shortDesc || '',
          discountPrice: parseFloat(discountPrice) || 0,
          isWholesale: isActuallyWholesale,
        });
      } else if (code.startsWith('WS')) {
        products.push({
          id: code,
          imageId: fileId,
          title: sheetTitle || description || `Wholesale ${code}`,
          price: 0,
          category: category || '',
          tags: tags.length > 0 ? tags : ['Wholesale'],
          shortDesc: shortDesc || '',
          description: description || shortDesc || '',
          discountPrice: 0,
          isWholesale: true,
        });
      }
    }

    const response: ProductsApiResponse = { products };

    return Response.json(response, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return Response.json(
      { error: 'Failed to fetch product data. Please check sheet permissions.' },
      { status: 500 }
    );
  }
}
