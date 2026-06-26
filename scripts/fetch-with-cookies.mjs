/**
 * Fetch Shopee product data using session cookies from user's browser.
 * 
 * Usage: 
 *   node scripts/fetch-with-cookies.mjs <cookie_string>
 * 
 * To get cookies:
 * 1. Open https://shopee.vn in Chrome (logged in)
 * 2. F12 → Application → Cookies → shopee.vn
 * 3. Right-click → Copy all as JSON (or copy as string)
 * 4. Pass as first argument
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGE_CACHE_DIR = path.join(__dirname, '..', 'public', 'cached-images');

[DATA_DIR, IMAGE_CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const IMAGE_BASE = 'https://cf.shopee.vn/file/';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

// URLs to fetch - product detail pages using /api/v4/item/get
const PRODUCTS = [
  { name: 'Bìa màu trắng A4 (Tập 100 tờ)', shopid: '11015391', itemid: '2839436309' },
  { name: 'Bút nước LinC Excutive nét 0.5mm', shopid: '11015391', itemid: '17224866805' },
  { name: 'TẶNG 02 RUỘT DL - Lố 20 ruột bút nước LinC ngòi 0.5mm', shopid: '11015391', itemid: '2006912083' },
  { name: 'TẶNG 03 RUỘT DL - Hộp 12 bút nước LinC Excutive nét 0.5mm', shopid: '11015391', itemid: '12682195042' },
  { name: 'Sổ đoàn viên màu hồng', shopid: '11015391', itemid: '11613045369' },
  { name: 'Hộp 12 Bút nước siêu trơn Deli A575/G575 ngòi 0.5mm', shopid: '11015391', itemid: '18591035285' },
  { name: 'Lốc 5 Vở kẻ ngang Campus Landscape 200 trang', shopid: '11015391', itemid: '13236314456' },
  { name: 'MẪU MỚI 2023 - Giấy kiểm tra Campus kẻ ngang có chấm 20 tờ đôi/10 đơn', shopid: '11015391', itemid: '22080387351' },
  { name: 'Lốc 10 Vở kẻ ngang Campus HEALING 120 trang Tặng bút bi MG', shopid: '11015391', itemid: '23671705019' },
  { name: 'Nhãn vở Campus FOOD NT FOD12 (12 nhãn/túi)', shopid: '11015391', itemid: '9991529930' },
];

function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bút') || n.includes('pen') || n.includes('marker') || n.includes('ngòi') || n.includes('ruột')) return 'Bút viết';
  if (n.includes('giấy') || n.includes('vở') || n.includes('sổ') || n.includes('nhãn') || n.includes('trang')) return 'Giấy & Sổ';
  if (n.includes('bìa') || n.includes('kẹp') || n.includes('hồ sơ')) return 'Lưu trữ';
  if (n.includes('màu') || n.includes('vẽ')) return 'Mỹ Thuật';
  return 'Văn phòng phẩm';
}

async function downloadImage(imageId, itemId) {
  if (!imageId) return null;
  const url = `${IMAGE_BASE}${imageId}`;
  const localName = `shopee_${itemId}_${imageId}.jpg`;
  const localPath = path.join(IMAGE_CACHE_DIR, localName);
  const publicPath = `/cached-images/${localName}`;
  
  if (fs.existsSync(localPath)) return publicPath;
  try {
    const resp = await axios({ method: 'get', url, responseType: 'stream', timeout: 15000 });
    const writer = fs.createWriteStream(localPath);
    resp.data.pipe(writer);
    await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
    return publicPath;
  } catch { return null; }
}

async function main() {
  const cookieStr = process.argv[2];
  
  if (!cookieStr) {
    console.log('❌ Cần cung cấp cookies!');
    console.log('');
    console.log('📋 Cách lấy cookies:');
    console.log('   1. Mở Chrome, vào https://shopee.vn (đã đăng nhập)');
    console.log('   2. F12 → Application → Cookies → shopee.vn');
    console.log('   3. Click từng cookie, copy giá trị "Value" của mỗi cái');
    console.log('   4. Hoặc dùng extension "EditThisCookie" để export JSON');
    console.log('');
    console.log('🔧 Chạy lệnh:');
    console.log('   node scripts/fetch-with-cookies.mjs "cookie_string_here"');
    console.log('');
    console.log('📋 Hoặc paste cookies JSON vào đây, tôi sẽ xử lý:');
    
    // Read from stdin
    const stdin = fs.readFileSync('/dev/stdin', 'utf-8').trim();
    if (!stdin) process.exit(1);
    
    // Handle JSON array format from Chrome devtools
    try {
      const cookies = JSON.parse(stdin);
      if (Array.isArray(cookies)) {
        const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
        return await fetchProducts(cookieStr);
      }
    } catch {}
    
    return await fetchProducts(stdin);
  }
  
  return await fetchProducts(cookieStr);
}

async function fetchProducts(cookieStr) {
  console.log('🔑 Using cookies to fetch Shopee products...\n');

  // Normalize cookie string
  let cleanedCookies = cookieStr;
  // If it's JSON array from Chrome DevTools
  try {
    const parsed = JSON.parse(cookieStr);
    if (Array.isArray(parsed)) {
      cleanedCookies = parsed.map(c => `${c.name}=${c.value}`).join('; ');
    }
  } catch {}

  console.log(`📦 Fetching ${PRODUCTS.length} products...\n`);

  const api = axios.create({
    baseURL: 'https://shopee.vn/api/v4',
    timeout: 15000,
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'vi,en;q=0.5',
      'Referer': 'https://shopee.vn/',
      'Origin': 'https://shopee.vn',
      'Cookie': cleanedCookies,
      'x-requested-with': 'XMLHttpRequest',
      'If-None-Match-': '',  // bypass cache
    },
  });

  const results = [];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    process.stdout.write(`[${i + 1}/${PRODUCTS.length}] ${p.name.substring(0, 45)}... `);

    try {
      const resp = await api.get('/item/get', {
        params: { itemid: p.itemid, shopid: p.shopid },
      });

      if (resp.data?.error === 0 && resp.data?.data) {
        const d = resp.data.data;
        const price = Math.round(d.price / 100000);
        const originalPrice = d.price_before_discount ? Math.round(d.price_before_discount / 100000) : undefined;
        const imageId = d.image || (d.images?.[0]);

        // Download image
        let imageUrl = '/placeholder.png';
        if (imageId) {
          const cached = await downloadImage(imageId, p.itemid);
          if (cached) imageUrl = cached;
          else imageUrl = `${IMAGE_BASE}${imageId}`;
        }

        results.push({
          id: p.itemid,
          name: p.name,
          price,
          originalPrice,
          image: imageUrl,
          category: categorizeProduct(p.name),
          brand: d.brand || 'Ennilo',
          rating: d.item_rating?.rating_star || 5,
          sold: d.historical_sold || d.sold || 0,
          discount: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined,
        });

        console.log(`✅ ${price.toLocaleString()}đ`);
      } else {
        console.log(`⚠ API error: ${JSON.stringify(resp.data).substring(0, 50)}`);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('❌ 403 Forbidden - Cookies có thể đã hết hạn hoặc không hợp lệ');
        console.log('   Vui lòng lấy cookies mới từ Chrome!');
      } else {
        console.log(`❌ ${err.message}`);
      }
    }
  }

  // Summary
  console.log(`\n📊 Kết quả: ${results.length}/${PRODUCTS.length} sản phẩm thành công`);

  if (results.length > 0) {
    // Save JSON
    const output = { scrapedAt: new Date().toISOString(), products: results };
    const jsonPath = path.join(DATA_DIR, 'shopee-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`💾 Saved to: ${jsonPath}`);

    // Print summary
    console.log('\n📋 Danh sách sản phẩm:');
    results.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 50)}`);
      console.log(`      💰 ${p.price.toLocaleString()}đ${p.originalPrice ? ` → ${p.originalPrice.toLocaleString()}đ` : ''}${p.discount ? ` (-${p.discount}%)` : ''} | ⭐ ${p.rating} | 📦 ${p.sold} | 📁 ${p.category}`);
    });

    // Generate TS file for importing
    const tsProducts = results.map(p => ({
      id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
      image: p.image, category: p.category, brand: p.brand, rating: p.rating, sold: p.sold, discount: p.discount,
    }));
    const tsContent = `// Auto-generated from Shopee - ${new Date().toISOString()}
import type { Product } from '@/lib/data';

export const shopeeProducts: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;
    const tsPath = path.join(DATA_DIR, 'shopee-products.ts');
    fs.writeFileSync(tsPath, tsContent, 'utf-8');
    console.log(`💾 TS version: ${tsPath}`);
  }

  return results;
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
