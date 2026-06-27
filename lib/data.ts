export interface ProductModel {
  model_id: number;
  name: string;
  price: number;
  stock: number | null;
  image: string | null;
}

export interface ProductVariation {
  name: string;
  options: string[];
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  price_min?: number;
  price_max?: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  sold: number;
  discount?: number;
  description?: string;
  images?: string[];
  models?: ProductModel[];
  variations?: ProductVariation[];
  categories?: string[];
}

import { shopeeProducts } from '@/data/shopee-products';

export const products: Product[] = shopeeProducts;

// Dynamic categories from actual products
export function getCategories(): string[] {
  const cats = new Set(products.map(p => p.category));
  return Array.from(cats);
}
