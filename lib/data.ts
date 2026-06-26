export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  sold: number;
  discount?: number;
}

import { shopeeProducts } from '@/data/shopee-products';

export const products: Product[] = shopeeProducts;

// Dynamic categories from actual products
export function getCategories(): string[] {
  const cats = new Set(products.map(p => p.category));
  return Array.from(cats);
}
