import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'shopee-products.json');
const IMAGE_BASE = 'https://cf.shopee.vn/file/';

const SHOP_USERNAME = 'ennilo';
const MAX_PRODUCTS = 80;

async function scrapeShopPage() {
  console.log(`🚀 Launching browser to scrape Shopee shop: ${SHOP_USERNAME}...\n`);

  const browser = await chromium.launch({
    headless: false, // headful mode to bypass detection
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,900',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    geolocation: { latitude: 21.0285, longitude: 105.8542 },
    permissions: ['geolocation'],
  });

  const page = await context.newPage();

  try {
    // First visit main page to set cookies
    console.log('📄 Step 1: Visiting Shopee main page...');
    await page.goto('https://shopee.vn/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    }).catch(() => {});
    await page.waitForTimeout(2000);

    // Now navigate to the shop page
    console.log(`📄 Step 2: Navigating to ${SHOP_USERNAME} shop...`);
    await page.goto(`https://shopee.vn/${SHOP_USERNAME}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    }).catch(() => {});
    
    // Wait for the page to render
    await page.waitForTimeout(5000);

    // Take a screenshot for debugging
    await page.screenshot({ path: path.join(DATA_DIR, 'shopee-debug.png'), fullPage: false });
    console.log('📸 Debug screenshot saved');

    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`   Title: ${title}`);
    console.log(`   URL: ${url}`);

    // Try to extract data from the page
    // Method 1: Look for __NEXT_DATA__ or __INITIAL_DATA__
    const pageData = await page.evaluate(() => {
      try {
        // Check various possible data locations
        const dataSources = [];

        // Check window.__INITIAL_DATA__
        if (window.__INITIAL_DATA__) {
          dataSources.push({ source: '__INITIAL_DATA__', data: window.__INITIAL_DATA__ });
        }

        // Check window.__PRELOADED_STATE__
        if (window.__PRELOADED_STATE__) {
          dataSources.push({ source: '__PRELOADED_STATE__', data: window.__PRELOADED_STATE__ });
        }

        // Check window.__data
        if (window.__data) {
          dataSources.push({ source: '__data', data: window.__data });
        }

        // Look for specific shop data 
        if (window.shopData) {
          dataSources.push({ source: 'shopData', data: window.shopData });
        }

        // Check for product items in the DOM
        const productElements = document.querySelectorAll('[data-sqe="item"], .shopee-search-item-result__item, [data-seller-id], .shopee-item-card');
        
        return {
          dataSources,
          productElementCount: productElements.length,
          htmlSample: document.body?.innerHTML?.substring(0, 2000),
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log(`\n📊 Page Analysis:`);
    console.log(`   Data sources found: ${pageData.dataSources?.length || 0}`);
    console.log(`   Product elements: ${pageData.productElementCount || 0}`);

    if (pageData.dataSources?.length > 0) {
      console.log('\n📦 Found data sources:');
      pageData.dataSources.forEach((ds, i) => {
        console.log(`   ${i + 1}. ${ds.source}:`, JSON.stringify(ds.data).substring(0, 200));
      });
    }

    // Method 2: Intercept API responses to get product data
    const apiResponses = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/v4/recommend/recommend') || 
          url.includes('/api/v4/search/search_items') ||
          url.includes('/api/v4/shop/get_shop_detail') ||
          url.includes('/api/v4/item/get') ||
          url.includes('/api/v4/pdp/get_pc')) {
        try {
          const json = await response.json();
          apiResponses.push({ url, data: json });
        } catch (e) {
          // Not JSON
        }
      }
    });

    // Scroll to load more products
    console.log('\n📜 Scrolling to load more products...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 800);
      });
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(3000);

    console.log(`   API responses captured: ${apiResponses.length}`);

    // Try to extract product data from the rendered page
    const extractedData = await page.evaluate((imgBase) => {
      const products = [];
      
      // Try to find product containers - Shopee shop page structure
      // Look for product cards in the main content area
      const possibleItems = document.querySelectorAll(
        '[data-sqe="item"], ' +
        '.product-card, ' +
        '[class*="product"], ' +
        '[class*="item-card"], ' +
        '.shopee-search-item-result__item, ' +
        'a[href*="/product/"], ' +
        'div[class*="shop-page"] [class*="item"]'
      );

      console.log(`Found ${possibleItems.length} potential product elements`);
      
      // Look for product links 
      const productLinks = document.querySelectorAll('a[href*="shopee.vn/product/"], a[href*="/product/"]');
      const seen = new Set();
      
      productLinks.forEach(link => {
        const href = link.href;
        if (seen.has(href)) return;
        seen.add(href);
        
        // Extract names from nearby elements
        const nameEl = link.querySelector('[class*="name"], [class*="title"], [class*="product-name"]');
        const priceEl = link.querySelector('[class*="price"], [class*="discount"]');
        const imageEl = link.querySelector('img');
        const soldEl = link.querySelector('[class*="sold"], [class*="sale"]');
        const ratingEl = link.querySelector('[class*="rating"], [class*="star"]');
        
        products.push({
          url: href,
          name: nameEl?.textContent?.trim() || '',
          price: priceEl?.textContent?.trim() || '',
          image: imageEl?.src || '',
          sold: soldEl?.textContent?.trim() || '',
          rating: ratingEl?.textContent?.trim() || '',
          alt: imageEl?.alt || '',
        });
      });

      return {
        products,
        totalLinks: productLinks.length,
        seenCount: seen.size,
      };
    }, IMAGE_BASE);

    console.log(`\n📦 Products extracted from DOM: ${extractedData.products?.length || 0}`);
    if (extractedData.products?.length > 0) {
      extractedData.products.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name || p.alt || p.url}`);
      });
    }

    // Also get the page HTML for analysis
    const htmlContent = await page.content();
    fs.writeFileSync(path.join(DATA_DIR, 'shopee-page.html'), htmlContent);
    console.log('\n💾 Page HTML saved to data/shopee-page.html');

    // Save API responses
    if (apiResponses.length > 0) {
      fs.writeFileSync(path.join(DATA_DIR, 'shopee-api.json'), JSON.stringify(apiResponses, null, 2));
      console.log('💾 API responses saved to data/shopee-api.json');
    }

    await browser.close();
    
    return {
      pageUrl: url,
      pageTitle: title,
      dataSources: pageData,
      apiResponses: apiResponses,
      extractedData: extractedData,
    };
  } catch (err) {
    console.error('✗ Error:', err.message);
    await browser.close();
    throw err;
  }
}

async function main() {
  const result = await scrapeShopPage();

  console.log('\n\n══════════════════════════════════');
  console.log('📋 SCRAPING RESULTS');
  console.log('══════════════════════════════════');
  console.log(`   URL: ${result.pageUrl}`);
  console.log(`   Title: ${result.pageTitle}`);
  console.log(`   API responses: ${result.apiResponses?.length || 0}`);
  console.log(`   DOM products: ${result.extractedData?.products?.length || 0}`);
  
  if (result.extractedData?.products?.length > 0) {
    console.log('\n✅ Some products were found via DOM extraction!');
    console.log('   Check data/shopee-page.html for the full page HTML');
    console.log('   Check data/shopee-debug.png for a screenshot');
  } else {
    console.log('\n❌ No products could be extracted from the page.');
    console.log('   Shopee is blocking automated access.');
    console.log('\n💡 Alternative suggestions:');
    console.log('   1. Visit the shop page manually, copy product data');
    console.log('   2. Use an ecommerce scraping API service (Apify, ScrapingBee, etc.)');
    console.log('   3. Ask the shop owner for a product list/catalog');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
