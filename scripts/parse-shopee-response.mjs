import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGE_CACHE_DIR = path.join(__dirname, '..', 'public', 'cached-images');

[DATA_DIR, IMAGE_CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const IMAGE_BASE = 'https://cf.shopee.vn/file/';

function categorize(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bút') || n.includes('pen') || n.includes('ngòi') || n.includes('ruột') || n.includes('mực')) return 'Bút viết';
  if (n.includes('vở') || n.includes('giấy') || n.includes('sổ') || n.includes('nhãn') || n.includes('trang')) return 'Giấy & Sổ';
  if (n.includes('bìa') || n.includes('kẹp') || n.includes('hồ sơ') || n.includes('tài liệu') || n.includes('túi') || n.includes('bọc')) return 'Lưu trữ';
  if (n.includes('màu') || n.includes('vẽ')) return 'Mỹ Thuật';
  if (n.includes('thước') || n.includes('kéo') || n.includes('tẩy') || n.includes('compa')) return 'Dụng cụ học tập';
  return 'Văn phòng phẩm';
}

async function downloadImage(imageId, itemId) {
  if (!imageId) return '/placeholder.png';
  const url = `${IMAGE_BASE}${imageId}`;
  const localName = `shopee_${itemId}_${imageId.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
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
    return url; // fallback to CDN URL
  }
}

// Read the API response from stdin or from args
async function main() {
  const inputPath = process.argv[2] || '/dev/stdin';
  
  let raw;
  if (inputPath === '/dev/stdin') {
    raw = fs.readFileSync('/dev/stdin', 'utf-8');
  } else {
    raw = fs.readFileSync(inputPath, 'utf-8');
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('✗ Invalid JSON:', e.message);
    process.exit(1);
  }

  // Navigate to the item cards — handle both with and without `data` wrapper
  const items = data?.data?.centralize_item_card?.item_cards || data?.centralize_item_card?.item_cards;
  if (!items || !items.length) {
    console.error('✗ No items found in the response');
    console.error('  Tried: data.centralize_item_card.item_cards and centralize_item_card.item_cards');
    process.exit(1);
  }

  console.log(`📦 Found ${items.length} products in API response\n`);

  const products = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const asset = item.item_card_displayed_asset || {};
    const priceInfo = item.item_card_display_price || {};

    const name = asset.name || '';
    const price = Math.round(priceInfo.price / 100000);
    const rawOrigPrice = priceInfo.original_price ? Math.round(priceInfo.original_price / 100000) : undefined;
    const origPrice = rawOrigPrice && rawOrigPrice !== price ? rawOrigPrice : undefined;
    const imageId = asset.image || '';
    const brand = item.global_brand?.display_name || 'Ennilo';
    const rating = asset.rating?.rating_text ? parseFloat(asset.rating.rating_text) : 5;
    
    // Parse sold count from text like "443 đã bán"
    let sold = 0;
    if (asset.sold_count?.text) {
      const match = asset.sold_count.text.match(/([\d.]+)/);
      if (match) sold = parseInt(match[1].replace(/\./g, ''));
    }

    const discount = origPrice && price > 0 && origPrice > price 
      ? Math.round(((origPrice - price) / origPrice) * 100) 
      : undefined;

    process.stdout.write(`[${i + 1}/${items.length}] ${(name || '').substring(0, 45)}... `);

    // Download image
    const imageUrl = await downloadImage(imageId, item.itemid);

    const product = {
      id: String(item.itemid),
      name: name,
      price: price,
      originalPrice: origPrice,
      image: imageUrl,
      category: categorize(name),
      brand: brand,
      rating: rating || 5,
      sold: sold,
      discount: discount,
    };

    products.push(product);
    console.log(`✅ ${price.toLocaleString()}đ`);
  }

  // Save JSON
  const output = {
    scrapedAt: new Date().toISOString(),
    shop: { username: 'ennilo', shopid: '11015391' },
    totalProducts: products.length,
    products,
  };

  const jsonPath = path.join(DATA_DIR, 'shopee-products.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 Saved: ${jsonPath}`);

  // Save TS
  const tsProducts = products.map(p => ({
    id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
    image: p.image, category: p.category, brand: p.brand, rating: p.rating,
    sold: p.sold, discount: p.discount,
  }));
  const tsContent = `// Auto-generated from Shopee API - ${new Date().toISOString()}
import type { Product } from '@/lib/data';

export const shopeeProducts: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;
  fs.writeFileSync(path.join(DATA_DIR, 'shopee-products.ts'), tsContent, 'utf-8');
  console.log('💾 Saved: data/shopee-products.ts');

  // Print summary
  console.log('\n📋 Products:');
  products.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name.substring(0, 60)}`);
    console.log(`      💰 ${p.price.toLocaleString()}đ${p.originalPrice ? ` → ${p.originalPrice.toLocaleString()}đ` : ''}${p.discount ? ` (-${p.discount}%)` : ''} | ⭐ ${p.rating} | 📦 ${p.sold} | 📁 ${p.category}`);
  });

  return products;
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
