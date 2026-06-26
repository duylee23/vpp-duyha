import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'shopee-products.json');

// Shopee Vietnam config
const SHOPEE_DOMAIN = 'https://shopee.vn';
const API_BASE = `${SHOPEE_DOMAIN}/api/v4`;
const IMAGE_BASE = 'https://cf.shopee.vn/file/';

// Config
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const shopUsername = process.argv[2] || 'ennilo';
const maxProducts = parseInt(process.argv[3] || '80');

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Referer': `${SHOPEE_DOMAIN}/`,
    'Origin': SHOPEE_DOMAIN,
    'x-requested-with': 'XMLHttpRequest',
  },
});

// Initialize cookies by making a dummy request
async function initCookie() {
  try {
    const resp = await axios.get(`${SHOPEE_DOMAIN}/`, {
      timeout: 10000,
      headers: { 'User-Agent': USER_AGENT },
      maxRedirects: 2,
    });
    const cookies = resp.headers['set-cookie'];
    if (cookies) {
      const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
      api.defaults.headers['Cookie'] = cookieStr;
      console.log('✓ Cookies initialized');
    }
  } catch (err) {
    console.warn('⚠ Could not init cookies, continuing without:', err.message);
  }
}

// Get shop ID from username
async function getShopId(username) {
  try {
    const resp = await api.get('/shop/get_shop_base', {
      params: { username },
      // Need separate instance with cookie init
    });
    const shopid = resp.data?.data?.shopid;
    if (!shopid) throw new Error('No shopid found in response');
    console.log(`✓ Found shop ID: ${shopid} for username: ${username}`);
    return shopid;
  } catch (err) {
    console.error('✗ Failed to get shop ID:', err.message);
    if (err.response) {
      console.error('  Status:', err.response.status);
      console.error('  Data:', JSON.stringify(err.response.data).slice(0, 200));
    }
    return null;
  }
}

// Get products from a shop
async function getShopProducts(shopId, maxItems = 80) {
  const domain = `${API_BASE}/recommend/recommend`;
  let offset = 0;
  const limit = 60;
  let hasMore = true;
  let allProducts = [];
  let attemptCount = 0;

  while (hasMore && allProducts.length < maxItems && attemptCount < 5) {
    attemptCount++;
    try {
      const params = {
        bundle: 'shop_page_category_tab_main',
        catid: '',
        item_card: 2,
        limit: limit,
        offset: offset,
        section: 'shop_page_category_tab_main_sec',
        shopid: shopId,
        sort_type: 1,
        tab_name: 'popular',
        upstream: '',
      };

      const resp = await api.get(domain, { params });
      const section = resp.data?.data?.sections?.[0];
      
      if (!section || !section.data?.item?.length) {
        console.log('  No more products found');
        hasMore = false;
        continue;
      }

      const items = section.data.item;
      allProducts = allProducts.concat(items);
      offset += items.length;
      hasMore = section.has_more ?? false;

      console.log(`  Fetched ${items.length} products (total: ${allProducts.length})`);

      // Be nice - small delay between pages
      if (hasMore) await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`✗ Error on page ${attemptCount}:`, err.message);
      if (err.response?.status === 403) {
        console.error('  Blocked by Shopee (403). Try again later or use different IP.');
      }
      hasMore = false;
    }
  }

  return allProducts.slice(0, maxItems);
}

// Parse Shopee products to our format
function parseProducts(shopItems) {
  return shopItems.map((item, index) => {
    // Price: Shopee API stores price in a special format
    // Divide by 100000 to get actual price
    const price = item.price / 100000;
    const originalPrice = item.price_before_discount 
      ? item.price_before_discount / 100000 
      : undefined;
    
    // Calculate discount percentage
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
        let sum = 0;
        let total = 0;
        count.forEach((num, i) => {
          sum += num * i;
          total += num;
        });
        if (total > 0) rating = sum / total;
      }
    }

    // Get image URL
    const imageId = item.image || (item.images?.[0]);
    const image = imageId ? `${IMAGE_BASE}${imageId}` : '/placeholder.png';

    // Map category from Shopee's category ID or use a default
    // Shopee products have a catid field
    let category = 'Văn phòng phẩm';
    if (item.catid) {
      // Simple category mapping based on common Shopee category IDs
      // We'll use the product's own categories or default
    }

    return {
      id: String(item.itemid),
      name: item.name || 'Sản phẩm',
      price: Math.round(price),
      originalPrice: originalPrice ? Math.round(originalPrice) : undefined,
      image: image,
      category: category,
      brand: item.brand || 'Ennilo',
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
      sold: item.historical_sold || item.sold || 0,
      discount: discount,
    };
  });
}

// Categorize products based on keywords in their names
function categorizeProduct(product) {
  const name = product.name.toLowerCase();
  
  if (name.includes('bút') || name.includes('pen') || name.includes('marker') || name.includes('highlighter') || name.includes('gel')) {
    return 'Bút viết';
  }
  if (name.includes('giấy') || name.includes('paper') || name.includes('sticker') || name.includes('note') || name.includes('notebook') || name.includes('sổ') || name.includes('vở')) {
    return 'Giấy & Sổ';
  }
  if (name.includes('thước') || name.includes('ruler') || name.includes('kéo') || name.includes('scissors') || name.includes('compass') || name.includes('compa')) {
    return 'Dụng cụ học tập';
  }
  if (name.includes('bìa') || name.includes('folder') || name.includes('file') || name.includes('hồ sơ') || name.includes('kẹp') || name.includes('clip')) {
    return 'Lưu trữ';
  }
  if (name.includes('màu') || name.includes('color') || name.includes('paint') || name.includes('vẽ') || name.includes('cọ') || name.includes('brush') || name.includes('pastel') || name.includes('watercolor')) {
    return 'Mỹ Thuật';
  }
  if (name.includes('cặp') || name.includes('túi') || name.includes('bag') || name.includes('balo') || name.includes('backpack')) {
    return 'Túi & Cặp';
  }
  
  return 'Văn phòng phẩm';
}

async function main() {
  console.log('🛒 Shopee Product Scraper');
  console.log(`   Shop: ${shopUsername}`);
  console.log('──────────────────────────────\n');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Init cookies
  await initCookie();
  await new Promise(r => setTimeout(r, 1000));

  // Get shop ID using a fresh request with cookies
  let shopId = null;

  // Method 1: Try using the get_shop_base API
  try {
    const cookieResp = await axios.get(`${SHOPEE_DOMAIN}/`, {
      timeout: 10000,
      headers: { 'User-Agent': USER_AGENT },
      maxRedirects: 2,
    });
    const cookies = cookieResp.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

    const shopResp = await axios.get(`${API_BASE}/shop/get_shop_base`, {
      params: { username: shopUsername },
      headers: {
        'User-Agent': USER_AGENT,
        'Cookie': cookieStr,
        'Referer': `${SHOPEE_DOMAIN}/${shopUsername}`,
      },
      timeout: 10000,
    });
    shopId = shopResp.data?.data?.shopid;
    console.log(`✓ Found shop ID via API: ${shopId}`);
  } catch (err) {
    console.warn('⚠ API get_shop_base failed:', err.message);
  }

  // Method 2: Try the search API to find the shop
  if (!shopId) {
    try {
      const searchResp = await axios.get(`${API_BASE}/search/search_items`, {
        params: {
          keyword: shopUsername,
          page_type: 'shop',
          scenario: 'PAGE_GLOBAL_SEARCH',
        },
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': `${SHOPEE_DOMAIN}/search?keyword=${shopUsername}`,
        },
        timeout: 10000,
      });
      // Try to extract shop ID from search results
      console.log('  Search response keys:', Object.keys(searchResp.data?.data || {}));
    } catch (err) {
      console.warn('⚠ Search API failed:', err.message);
    }
  }

  // Method 3: Try a direct approach - get shop detail
  if (!shopId) {
    try {
      const detailResp = await axios.get(`${API_BASE}/shop/get_shop_detail`, {
        params: { username: shopUsername },
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': `${SHOPEE_DOMAIN}/${shopUsername}`,
        },
        timeout: 10000,
      });
      shopId = detailResp.data?.data?.shopid;
      console.log(`✓ Found shop ID via get_shop_detail: ${shopId}`);
    } catch (err) {
      console.warn('⚠ get_shop_detail failed:', err.message);
    }
  }

  if (!shopId) {
    console.log('\n✗ Could not find shop ID automatically.');
    console.log('  Please visit https://shopee.vn/' + shopUsername);
    console.log('  Open DevTools > Network tab > refresh page');
    console.log('  Look for "shopid" in the request URLs or responses.');
    console.log('  Then run: node scripts/scrape-shopee.mjs ' + shopUsername + ' 80 <shopId>');
    
    // Try using a provided shop ID from command line
    const manualShopId = process.argv[4];
    if (manualShopId) {
      shopId = parseInt(manualShopId);
      console.log(`\nUsing manual shop ID: ${shopId}`);
    } else {
      process.exit(1);
    }
  }

  // Fetch products
  console.log(`\n📦 Fetching products for shop ID: ${shopId}...\n`);
  const rawProducts = await getShopProducts(shopId, maxProducts);

  if (!rawProducts.length) {
    console.log('\n✗ No products found.');
    process.exit(1);
  }

  console.log(`\n✓ Total products fetched: ${rawProducts.length}`);

  // Parse to our format
  let products = parseProducts(rawProducts);

  // Apply smart categorization
  products = products.map(p => ({
    ...p,
    category: categorizeProduct(p),
  }));

  // Group by category for display
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  console.log('\n📊 Products by category:');
  Object.entries(grouped).forEach(([cat, items]) => {
    console.log(`   ${cat}: ${items.length} products`);
  });

  // Save to file
  const output = {
    shop: {
      username: shopUsername,
      shopId: shopId,
      scrapedAt: new Date().toISOString(),
    },
    products: products,
    summary: {
      totalProducts: products.length,
      categories: Object.keys(grouped).length,
    },
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);

  // Also save a TS file for easy import
  const tsOutput = `// Auto-generated from Shopee scraper - ${new Date().toISOString()}
import type { Product } from './data';

export const shopeeProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const shopeeCategories: string[] = ${JSON.stringify(Object.keys(grouped), null, 2)};
`;

  const tsFile = path.join(DATA_DIR, 'shopee-products.ts');
  fs.writeFileSync(tsFile, tsOutput, 'utf-8');
  console.log(`💾 Saved TS version to: ${tsFile}`);

  // Print sample
  console.log('\n📋 Sample products:');
  products.slice(0, 3).forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`);
    console.log(`      💰 ${p.price.toLocaleString()}đ${p.originalPrice ? ` → ${p.originalPrice.toLocaleString()}đ` : ''}${p.discount ? ` (-${p.discount}%)` : ''}`);
    console.log(`      ⭐ ${p.rating} | 📦 ${p.sold} sold | 🏷 ${p.category}`);
    console.log('');
  });

  return output;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
