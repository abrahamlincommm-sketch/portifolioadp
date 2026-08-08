import axios from 'axios';

interface ScrapedProductData {
  title?: string;
  price?: number;
  currency?: string;
  images?: string[];
  description?: string;
}

export class LinkScraper {
  static async scrapeUrl(url: string): Promise<ScrapedProductData> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 10000,
      });

      const html = response.data;
      if (typeof html !== 'string') return {};

      const result: ScrapedProductData = {};

      // 1. JSON-LD Schema.org extraction
      const jsonLdMatches = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
      if (jsonLdMatches) {
        for (const match of jsonLdMatches) {
          try {
            const rawJson = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
            const data = JSON.parse(rawJson);
            
            const product = Array.isArray(data) 
              ? data.find(i => i['@type'] === 'Product') 
              : (data['@type'] === 'Product' ? data : (data['@graph']?.find((i: any) => i['@type'] === 'Product')));

            if (product) {
              if (product.name && !result.title) result.title = product.name;
              if (product.description && !result.description) result.description = product.description;
              if (product.image) {
                const img = Array.isArray(product.image) ? product.image[0] : (typeof product.image === 'string' ? product.image : product.image.url);
                if (img && !result.images) result.images = [img];
              }
              const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
              if (offers?.price && !result.price) {
                result.price = parseFloat(String(offers.price).replace(',', '.'));
                result.currency = offers.priceCurrency || 'BRL';
              }
            }
          } catch {
            // Ignore parse errors on individual scripts
          }
        }
      }

      // 2. OpenGraph Meta Tags Fallback
      if (!result.title) {
        const ogTitle = html.match(/<meta property=["']og:title["'] content=["'](.*?)["']/i) ||
                        html.match(/<meta name=["']twitter:title["'] content=["'](.*?)["']/i) ||
                        html.match(/<title>([^<]*)<\/title>/i);
        if (ogTitle) result.title = ogTitle[1].trim();
      }

      if (!result.images || result.images.length === 0) {
        const ogImage = html.match(/<meta property=["']og:image["'] content=["'](.*?)["']/i) ||
                        html.match(/<meta name=["']twitter:image["'] content=["'](.*?)["']/i);
        if (ogImage) result.images = [ogImage[1].trim()];
      }

      if (!result.description) {
        const ogDesc = html.match(/<meta property=["']og:description["'] content=["'](.*?)["']/i) ||
                       html.match(/<meta name=["']description["'] content=["'](.*?)["']/i);
        if (ogDesc) result.description = ogDesc[1].trim();
      }

      // 3. Price meta tags or regex fallback
      if (!result.price) {
        const ogPrice = html.match(/<meta property=["']product:price:amount["'] content=["'](.*?)["']/i) ||
                        html.match(/<meta property=["']og:price:amount["'] content=["'](.*?)["']/i);
        if (ogPrice) {
          result.price = parseFloat(ogPrice[1].replace(',', '.'));
        }
      }

      // 4. If price still not found, try common currency patterns in HTML
      if (!result.price) {
        const brlPattern = html.match(/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2})/i);
        if (brlPattern) {
          const clean = brlPattern[1].replace(/\./g, '').replace(',', '.');
          result.price = parseFloat(clean);
          result.currency = 'BRL';
        } else {
          const usdPattern = html.match(/US\$\s*([0-9]+(?:\.[0-9]{2})?)/i) || html.match(/\$\s*([0-9]+(?:\.[0-9]{2})?)/i);
          if (usdPattern) {
            result.price = parseFloat(usdPattern[1]);
            result.currency = 'USD';
          }
        }
      }

      return result;
    } catch (err: any) {
      console.error(`Falha ao puxar dados da URL (${url}):`, err.message);
      return {};
    }
  }
}
