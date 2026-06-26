/**
 * Script to fetch Shopee product details from user-provided URLs.
 * 
 * Usage: node scripts/fetch-product.mjs <url1> <url2> ...
 * Or provide URLs via STDIN
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGE_CACHE_DIR = path.join(__dirname, '..', 'public', 'cached-images');
const IMAGE_BASE = 'https://cf.shopee.vn/file/';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const API_BASE = 'https://shopee.vn/api/v4';

// Ensure directories exist
[DATA_DIR, IMAGE_CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Parse product URL to extract shopid and itemid
function parseProductUrl(url) {
  const patterns = [
    /\/product\/(\d+)\/(\d+)/,      // /product/123/456
    /i\.(\d+)\.(\d+)/,               // i.123.456
    /shopid=(\d+).*?itemid=(\d+)/,   // ?shopid=123&itemid=456
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { shopid: match[1], itemid: match[2] };
    }
  }
  return null;
}

// Try to get product details from Shopee API
async function getProductFromAPI(shopid, itemid) {
  try {
    // Method 1: item/get endpoint
    const resp = await axios.get(`${API_BASE}/item/get`, {
      params: { itemid, shopid },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': `https://shopee.vn/product/${shopid}/${itemid}`,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    if (resp.data?.error === 0 && resp.data?.data) {
      return { method: 'api-item-get', data: resp.data.data };
    }
  } catch (err) {
    // Method 2: pdp/get_pc endpoint
    try {
      const resp = await axios.get(`${API_BASE}/pdp/get_pc`, {
        params: { item_id: itemid, shop_id: shopid },
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': `https://shopee.vn/product/${shopid}/${itemid}`,
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      if (resp.data?.error === 0 && resp.data?.data) {
        return { method: 'api-pdp', data: resp.data.data };
      }
    } catch (err2) {
      // Method 3: Try to fetch the product page HTML and look for embedded data
      try {
        const resp = await axios.get(`https://shopee.vn/product/${shopid}/${itemid}`, {
          headers: {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml',
          },
          timeout: 10000,
          maxRedirects: 2,
        });

        const html = resp.data;

        // Look for JSON data in script tags
        const jsonPatterns = [
          /window\.__INITIAL_DATA__\s*=\s*({.+?});/,
          /window\.__PRELOADED_STATE__\s*=\s*({.+?});/,
          /"item"\s*:\s*({.+?}),\s*"shop"/,
          /data-sqe="item"[^>]*data-item='({.+?})'/,
        ];

        for (const pattern of jsonPatterns) {
          const match = html.match(pattern);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              return { method: 'html-embed', data };
            } catch (e) {
              // Try to fix truncated JSON
            }
          }
        }

        return { method: 'html', data: null, html: html.substring(0, 10000) };
      } catch (err3) {
        return { method: 'failed', error: err3.message };
      }
    }
  }
}

// Extract product name from the page title or HTML
function extractNameFromHTML(html) {
  const titleMatch = html.match(/<title>(.+?)<\/title>/);
  if (titleMatch) {
    let title = titleMatch[1];
    // Remove shop name suffixes like " | Shopee Việt Nam"
    title = title.replace(/\s*[||-]\s*Shopee.*$/, '').trim();
    return title;
  }
  return null;
}

// Parse Shopee product data to our format
function parseProductData(rawData, method, url) {
  let item = null;
  let shopid = null;
  let itemid = null;

  // Extract item data based on method
  if (method === 'api-item-get' && rawData) {
    item = rawData;
    shopid = rawData.shopid;
    itemid = rawData.itemid;
  } else if (method === 'api-pdp' && rawData) {
    item = rawData;
    shopid = rawData.shopid || rawData.shop?.shopid;
    itemid = rawData.itemid || rawData.item?.itemid;
  }

  if (!item) return null;

  // Calculate price
  const price = item.price ? Math.round(item.price / 100000) : 0;
  const originalPrice = item.price_before_discount 
    ? Math.round(item.price_before_discount / 100000) 
    : undefined;

  // Calculate discount
  let discount = undefined;
  if (originalPrice && originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  // Get rating
  let rating = 5;
  if (item.item_rating) {
    if (item.item_rating.rating_star) {
      rating = item.item_rating.rating_star;
    } else if (item.item_rating.rating_count) {
      const count = item.item_rating.rating_count;
      let sum = 0, total = 0;
      count.forEach((num, i) => { sum += num * i; total += num; });
      if (total > 0) rating = sum / total;
    }
  }

  // Get image
  const imageId = item.image || (item.images && item.images[0]);
  const imageUrl = imageId ? `${IMAGE_BASE}${imageId}` : null;

  return {
    id: String(itemid || item.item_id || ''),
    name: item.name || '',
    price: price,
    originalPrice: originalPrice,
    image: imageUrl || '/placeholder.png',
    category: categorizeProduct(item.name || ''),
    brand: item.brand || 'Ennilo',
    rating: Math.round(rating * 10) / 10,
    sold: item.historical_sold || item.sold || 0,
    discount: discount,
    _shopid: shopid,
    _itemid: itemid,
    _imageId: imageId,
  };
}

// Smart categorization
function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bút') || n.includes('pen') || n.includes('marker') || n.includes('highlighter') || n.includes('gel') || n.includes('mực')) return 'Bút viết';
  if (n.includes('giấy') || n.includes('paper') || n.includes('sticker') || n.includes('note') || n.includes('notebook') || n.includes('sổ') || n.includes('vở')) return 'Giấy & Sổ';
  if (n.includes('thước') || n.includes('ruler') || n.includes('kéo') || n.includes('scissors') || n.includes('compass') || n.includes('compa') || n.includes('tẩy') || n.includes('gôm')) return 'Dụng cụ học tập';
  if (n.includes('bìa') || n.includes('folder') || n.includes('file') || n.includes('hồ sơ') || n.includes('kẹp') || n.includes('clip') || n.includes('kim')) return 'Lưu trữ';
  if (n.includes('màu') || n.includes('color') || n.includes('paint') || n.includes('vẽ') || n.includes('cọ') || n.includes('brush') || n.includes('pastel') || n.includes('watercolor')) return 'Mỹ Thuật';
  if (n.includes('cặp') || n.includes('túi') || n.includes('bag') || n.includes('balo') || n.includes('backpack')) return 'Túi & Cặp';
  if (n.includes('keo') || n.includes('glue') || n.includes('băng') || n.includes('tape') || n.includes('dán')) return 'Keo & Băng dính';
  return 'Văn phòng phẩm';
}

// Download and cache image
async function downloadImage(imageId, itemId) {
  if (!imageId) return null;
  
  const imageUrl = `${IMAGE_BASE}${imageId}`;
  const ext = '.jpg'; // Shopee images are JPG
  const localName = `shopee_${itemId}_${imageId}${ext}`;
  const localPath = path.join(IMAGE_CACHE_DIR, localName);
  const publicPath = `/cached-images/${localName}`;

  // Skip if already downloaded
  if (fs.existsSync(localPath)) {
    return publicPath;
  }

  try {
    const resp = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
      timeout: 15000,
      headers: { 'User-Agent': USER_AGENT },
    });

    const writer = fs.createWriteStream(localPath);
    resp.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return publicPath;
  } catch (err) {
    console.warn(`  ⚠ Could not download image: ${err.message}`);
    return imageUrl; // Fall back to remote URL
  }
}

// Main function
async function main() {
  const urls = process.argv.slice(2);

  if (urls.length === 0) {
    console.log('📋 Cách dùng: node scripts/fetch-product.mjs <url1> <url2> ...');
    console.log('   Ví dụ: node scripts/fetch-product.mjs "https://shopee.vn/..." "https://shopee.vn/..."');
    process.exit(1);
  }

  console.log(`🛒 Fetching ${urls.length} Shopee products...\n`);

  const products = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Processing: ${url.substring(0, 60)}...`);

    const parsed = parseProductUrl(url);
    if (!parsed) {
      console.log(`  ✗ Could not parse URL`);
      continue;
    }

    console.log(`   Shop ID: ${parsed.shopid}, Item ID: ${parsed.itemid}`);

    // Try to get product data
    const result = await getProductFromAPI(parsed.shopid, parsed.itemid);
    
    if (result.method === 'failed') {
      console.log(`   ✗ API failed: ${result.error}`);
      console.log(`   ℹ Adding product with basic info from URL...`);
      
      // Extract name from URL
      const urlName = decodeURIComponent(url.split('/').pop() || '')
        .replace(/-i\.\d+\.\d+.*$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      products.push({
        id: parsed.itemid,
        name: urlName || `Sản phẩm ${parsed.itemid}`,
        price: 0,
        image: '/placeholder.png',
        category: 'Văn phòng phẩm',
        brand: 'Ennilo',
        rating: 0,
        sold: 0,
      });
      continue;
    }

    // Parse the data
    const product = parseProductData(result.data, result.method, url);
    
    if (!product) {
      console.log(`   ✗ Could not parse product data`);
      continue;
    }

    // Download image
    if (product._imageId) {
      const localImage = await downloadImage(product._imageId, product.id);
      if (localImage) {
        product.image = localImage;
        console.log(`   📸 Image cached: ${localImage}`);
      }
    }

    products.push(product);
    console.log(`   ✅ ${product.name}`);
    console.log(`      💰 ${product.price.toLocaleString()}đ${product.originalPrice ? ` → ${product.originalPrice.toLocaleString()}đ` : ''} | ⭐ ${product.rating} | 📦 ${product.sold} sold`);
  }

  // Save results
  const output = {
    scrapedAt: new Date().toISOString(),
    totalProducts: products.length,
    products: products,
  };

  const jsonPath = path.join(DATA_DIR, 'manual-products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 Saved to: ${jsonPath}`);
  console.log(`📦 Total products: ${products.length}`);

  if (products.length > 0) {
    // Also generate TypeScript
    const tsProducts = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image,
      category: p.category,
      brand: p.brand,
      rating: p.rating,
      sold: p.sold,
      discount: p.discount,
    }));

    const tsPath = path.join(DATA_DIR, 'manual-products.ts');
    const tsContent = `// Auto-generated from Shopee product URLs - ${new Date().toISOString()}
import type { Product } from '@/lib/data';

export const manualProducts: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;
    fs.writeFileSync(tsPath, tsContent, 'utf-8');
    console.log(`💾 TS version saved to: ${tsPath}`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
