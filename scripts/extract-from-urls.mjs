/**
 * Extract product info from Shopee product URLs
 * Falls back to URL-based extraction when API is blocked
 * 
 * Usage: node scripts/extract-from-urls.mjs <url1> <url2> ...
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGE_CACHE_DIR = path.join(__dirname, '..', 'public', 'cached-images');
const IMAGE_BASE = 'https://cf.shopee.vn/file/';

[DATA_DIR, IMAGE_CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const USER_AGENT = 'Mozilla/5.0';

function decodeShopeeUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Extract: /Ten-san-pham-i.{shopid}.{itemid}
    const match = path.match(/-i\.(\d+)\.(\d+)/);
    if (!match) return null;

    const shopid = match[1];
    const itemid = match[2];

    // Extract product name: remove "-i.{shopid}.{itemid}" from path
    let name = path.replace(/-i\.\d+\.\d+.*$/, '').replace(/^\//, '');
    name = decodeURIComponent(name);
    // Clean up name
    name = name.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();

    return { shopid, itemid, name };
  } catch {
    return null;
  }
}

function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bút') || n.includes('pen') || n.includes('marker') || n.includes('highlighter') || n.includes('gel') || n.includes('mực') || n.includes('ngòi')) return 'Bút viết';
  if (n.includes('giấy') || n.includes('paper') || n.includes('sticker') || n.includes('note') || n.includes('notebook') || n.includes('sổ') || n.includes('vở') || n.includes('trang')) return 'Giấy & Sổ';
  if (n.includes('thước') || n.includes('ruler') || n.includes('kéo') || n.includes('scissors') || n.includes('compass') || n.includes('compa') || n.includes('tẩy') || n.includes('gôm')) return 'Dụng cụ học tập';
  if (n.includes('bìa') || n.includes('folder') || n.includes('file') || n.includes('hồ sơ') || n.includes('kẹp') || n.includes('clip') || n.includes('nhãn')) return 'Lưu trữ';
  if (n.includes('màu') || n.includes('color') || n.includes('paint') || n.includes('vẽ') || n.includes('cọ') || n.includes('pastel') || n.includes('watercolor')) return 'Mỹ Thuật';
  if (n.includes('cặp') || n.includes('túi') || n.includes('bag') || n.includes('balo') || n.includes('backpack')) return 'Túi & Cặp';
  if (n.includes('keo') || n.includes('glue') || n.includes('băng') || n.includes('tape') || n.includes('dán')) return 'Keo & Băng dính';
  return 'Văn phòng phẩm';
}

// Try API one more time with different approaches
async function tryGetProductData(shopid, itemid) {
  // Try the item/get API endpoint
  const endpoints = [
    { url: `https://shopee.vn/api/v4/item/get`, params: { itemid, shopid } },
    { url: `https://shopee.vn/api/v4/pdp/get_pc`, params: { item_id: itemid, shop_id: shopid } },
  ];

  for (const { url, params } of endpoints) {
    try {
      const resp = await axios.get(url, {
        params,
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': `https://shopee.vn/product/${shopid}/${itemid}`,
        },
        timeout: 8000,
      });
      if (resp.data?.error === 0 && resp.data?.data) {
        const d = resp.data.data;
        return {
          name: d.name,
          price: d.price ? Math.round(d.price / 100000) : undefined,
          originalPrice: d.price_before_discount ? Math.round(d.price_before_discount / 100000) : undefined,
          image: d.image ? `${IMAGE_BASE}${d.image}` : null,
          imageId: d.image,
          images: d.images?.filter(Boolean).map(img => `${IMAGE_BASE}${img}`) || [],
          imageIds: d.images?.filter(Boolean) || [],
          rating: d.item_rating?.rating_star || undefined,
          sold: d.historical_sold || d.sold || undefined,
          brand: d.brand,
        };
      }
    } catch {}
  }
  return null;
}

// Download image from Shopee CDN
async function downloadImage(imageId, itemId) {
  if (!imageId) return null;
  
  const url = `${IMAGE_BASE}${imageId}`;
  const ext = '.jpg';
  const localName = `shopee_${itemId}_${imageId}${ext}`;
  const localPath = path.join(IMAGE_CACHE_DIR, localName);
  const publicPath = `/cached-images/${localName}`;

  if (fs.existsSync(localPath)) return publicPath;

  try {
    const resp = await axios({ method: 'get', url, responseType: 'stream', timeout: 15000 });
    const writer = fs.createWriteStream(localPath);
    resp.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    return publicPath;
  } catch {
    return null;
  }
}

// Try to find images for products by searching Google
async function findImagesFromGoogle(productName, itemId) {
  try {
    // Google search for the product
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(productName + ' shopee')}&tbm=isch`;
    const resp = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });
    
    // Try to extract image URLs from Google search results
    const imageUrls = [];
    const matches = resp.data.match(/"ou":"([^"]+)"/g) || [];
    for (const m of matches.slice(0, 3)) {
      const url = m.replace(/"ou":"/, '').replace(/"$/, '');
      url = url.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
      if (url.includes('shopee') || url.includes('img.shopee') || url.includes('cf.shopee')) {
        imageUrls.push(url);
      }
    }
    return imageUrls.length > 0 ? imageUrls : null;
  } catch {
    return null;
  }
}

async function main() {
  const urls = process.argv.slice(2);
  if (urls.length === 0) {
    console.log('Usage: node scripts/extract-from-urls.mjs <url1> <url2> ...');
    process.exit(1);
  }

  console.log(`📦 Extracting ${urls.length} products from URLs...\n`);

  const products = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const parsed = decodeShopeeUrl(url);
    
    if (!parsed) {
      console.log(`[${i + 1}] ✗ Could not parse URL`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${urls.length}] ${parsed.name.substring(0, 50)}... `);

    // Try to get data from API
    const apiData = await tryGetProductData(parsed.shopid, parsed.itemid);

    let product;
    if (apiData && apiData.price) {
      // API succeeded!
      console.log(`✅ API (${apiData.price?.toLocaleString()}đ)`);

      // Download images if available
      let imageUrl = apiData.image || '/placeholder.png';
      if (apiData.imageId) {
        const cached = await downloadImage(apiData.imageId, parsed.itemid);
        if (cached) imageUrl = cached;
      }

      product = {
        id: parsed.itemid,
        name: apiData.name || parsed.name,
        price: apiData.price || 0,
        originalPrice: apiData.originalPrice,
        image: imageUrl,
        category: categorizeProduct(apiData.name || parsed.name),
        brand: apiData.brand || 'Ennilo',
        rating: apiData.rating || 5,
        sold: apiData.sold || 0,
        discount: apiData.originalPrice && apiData.price 
          ? Math.round(((apiData.originalPrice - apiData.price) / apiData.originalPrice) * 100) 
          : undefined,
      };
    } else {
      // API failed - use URL-based data with placeholder
      console.log(`⚠ URL only (need price)`);
      
      // Try to find image from Google
      const googleImages = await findImagesFromGoogle(parsed.name, parsed.itemid);
      
      product = {
        id: parsed.itemid,
        name: parsed.name,
        price: 0, // Unknown - needs user input
        image: googleImages?.[0] || '/placeholder.png',
        category: categorizeProduct(parsed.name),
        brand: 'Ennilo',
        rating: 5,
        sold: 0,
      };
    }

    products.push(product);
  }

  // Save results
  const output = {
    scrapedAt: new Date().toISOString(),
    totalProducts: products.length,
    products,
  };

  const jsonPath = path.join(DATA_DIR, 'manual-products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 Saved to: ${jsonPath}`);

  // Print summary
  console.log(`\n📋 Summary:`);
  products.forEach((p, i) => {
    const priceStr = p.price > 0 ? `${p.price.toLocaleString()}đ` : '⚠ CẦN NHẬP GIÁ';
    console.log(`   ${i + 1}. ${p.name.substring(0, 50)}`);
    console.log(`      💰 ${priceStr} | 📁 ${p.category}`);
  });

  const unknownPrices = products.filter(p => !p.price || p.price === 0);
  if (unknownPrices.length > 0) {
    console.log(`\n⚠ ${unknownPrices.length} sản phẩm cần nhập giá!`);
    console.log('   Vui lòng cung cấp giá cho từng sản phẩm theo định dạng:');
    console.log('   <số thứ tự>: <giá>');
    console.log('   Ví dụ: 1: 15000 2: 25000 ...');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
