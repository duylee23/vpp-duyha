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

// Parse Chrome DevTools TSV cookie export
function parseCookieTsv(tsv) {
  const lines = tsv.trim().split('\n');
  const cookies = [];
  
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts[1].trim();
      if (name && value) {
        cookies.push({ name, value });
      }
    }
  }
  
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

function categorize(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('bút') || n.includes('pen') || n.includes('marker') || n.includes('ngòi') || n.includes('ruột')) return 'Bút viết';
  if (n.includes('giấy') || n.includes('vở') || n.includes('sổ') || n.includes('nhãn') || n.includes('trang')) return 'Giấy & Sổ';
  if (n.includes('bìa') || n.includes('kẹp') || n.includes('hồ sơ')) return 'Lưu trữ';
  return 'Văn phòng phẩm';
}

async function downloadImg(imageId, itemId) {
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
  // Read TSV cookie file
  const tsvPath = '/tmp/shopee_cookies.tsv';
  
  // Try reading from args first, then stdin
  let tsvData = '';
  
  if (fs.existsSync(tsvPath)) {
    tsvData = fs.readFileSync(tsvPath, 'utf-8');
  } else {
    // Read from stdin (pipe)
    tsvData = fs.readFileSync('/dev/stdin', 'utf-8');
  }
  
  if (!tsvData.trim()) {
    console.error('❌ No cookie data found. Save TSV to /tmp/shopee_cookies.tsv first.');
    process.exit(1);
  }

  const cookieStr = parseCookieTsv(tsvData);
  console.log('🔑 Cookies parsed successfully!\n');

  const api = axios.create({
    baseURL: 'https://shopee.vn/api/v4',
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'vi,en;q=0.5',
      'Referer': 'https://shopee.vn/',
      'Origin': 'https://shopee.vn',
      'Cookie': cookieStr,
      'x-requested-with': 'XMLHttpRequest',
      'x-csrftoken': 'yk9Cn5Sio0oPTkE4xJU4R8NDGMVrnA3X',
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
        const origPrice = d.price_before_discount ? Math.round(d.price_before_discount / 100000) : undefined;
        const imageId = d.image || (d.images?.[0]);

        let imageUrl = '/placeholder.png';
        if (imageId) {
          const cached = await downloadImg(imageId, p.itemid);
          imageUrl = cached || `${IMAGE_BASE}${imageId}`;
        }

        results.push({
          id: p.itemid,
          name: p.name,
          price,
          originalPrice: origPrice,
          image: imageUrl,
          category: categorize(p.name),
          brand: d.brand || 'Ennilo',
          rating: d.item_rating?.rating_star || 5,
          sold: d.historical_sold || d.sold || 0,
          discount: origPrice && price ? Math.round(((origPrice - price) / origPrice) * 100) : undefined,
        });

        console.log(`✅ ${price.toLocaleString()}đ`);
      } else {
        console.log(`⚠ Error: ${JSON.stringify(resp.data).substring(0, 80)}`);
      }
    } catch (err) {
      console.log(`❌ ${err.response?.status || err.message}`);
      if (err.response?.status === 403) {
        console.log('   Cookies expired! Please get fresh cookies from Chrome.');
        break;
      }
    }
  }

  console.log(`\n📊 Kết quả: ${results.length}/${PRODUCTS.length}`);
  
  if (results.length > 0) {
    const output = { scrapedAt: new Date().toISOString(), shop: 'ennilo', products: results };
    const jsonPath = path.join(DATA_DIR, 'shopee-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`💾 Saved: ${jsonPath}`);

    // Generate TS
    const tsProducts = results.map(p => ({
      id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
      image: p.image, category: p.category, brand: p.brand, rating: p.rating,
      sold: p.sold, discount: p.discount,
    }));
    const tsContent = `// Auto-generated from Shopee - ${new Date().toISOString()}
import type { Product } from '@/lib/data';

export const shopeeProducts: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;
    fs.writeFileSync(path.join(DATA_DIR, 'shopee-products.ts'), tsContent, 'utf-8');
    console.log('💾 Saved: data/shopee-products.ts');

    console.log('\n📋 Danh sách:');
    results.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name.substring(0, 45)}`);
      console.log(`      💰 ${p.price.toLocaleString()}đ${p.originalPrice ? ` → ${p.originalPrice.toLocaleString()}đ` : ''}${p.discount ? ` (-${p.discount}%)` : ''} | ⭐ ${p.rating} | 📁 ${p.category}`);
    });
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
