'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Sidebar from '@/components/Sidebar';
import type { Product } from '@/lib/data';

interface ProductGridProps {
  products: Product[];
  categories: string[];
}

type SortType = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = (searchParams.get('sort') as SortType) || 'newest';
  const priceRange = searchParams.get('price') || '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Filter by search query
  const filteredBySearch = useMemo(() => {
    if (!q) return products;
    const query = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [products, q]);

  // Filter by category
  const filteredByCategory = useMemo(() => {
    if (!category) return filteredBySearch;
    return filteredBySearch.filter((p) => p.category === category);
  }, [filteredBySearch, category]);

  // Filter by price range
  const priceRanges: Record<string, [number, number]> = {
    'under30': [0, 30000],
    '30to60': [30000, 60000],
    '60to100': [60000, 100000],
    'over100': [100000, Infinity],
  };

  const filtered = useMemo(() => {
    if (!priceRange || !priceRanges[priceRange]) return filteredByCategory;
    const [min, max] = priceRanges[priceRange];
    return filteredByCategory.filter((p) => p.price >= min && p.price < max);
  }, [filteredByCategory, priceRange]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case 'name_asc':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'name_desc':
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case 'price_asc':
        return arr.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return arr.sort((a, b) => b.price - a.price);
      case 'newest':
      default:
        return arr.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    }
  }, [filtered, sort]);

  const handleSort = (newSort: SortType) => {
    updateParam('sort', newSort);
  };

  const handleCategoryChange = (cat: string) => {
    updateParam('category', cat === category ? '' : cat);
  };

  const handlePriceRangeChange = (range: string) => {
    updateParam('price', range === priceRange ? '' : range);
  };

  // Sort button helper
  const SortButton = ({ value, label }: { value: SortType; label: string }) => (
    <button
      onClick={() => handleSort(value)}
      className={`transition-colors ${
        sort === value
          ? 'font-medium text-[#b91c1c] dark:text-red-400'
          : 'hover:text-[#b91c1c] dark:hover:text-red-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-8">
      <Sidebar
        categories={categories}
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        selectedPriceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      <div className="flex-1">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold text-gray-800 uppercase dark:text-white">
              {category || 'Tất cả sản phẩm'}
            </h2>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>

          {/* Sort / Filter Bar */}
          <div className="bg-gray-100 p-3 rounded-md flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-300">
            <span className="font-bold text-gray-800 dark:text-white">Sắp xếp:</span>
            <SortButton value="name_asc" label="Tên A → Z" />
            <SortButton value="name_desc" label="Tên Z → A" />
            <SortButton value="price_asc" label="Giá tăng dần" />
            <SortButton value="price_desc" label="Giá giảm dần" />
            <SortButton value="newest" label="Hàng mới" />
            {q && (
              <span className="ml-auto text-gray-500 dark:text-gray-400">
                Tìm: &quot;{q}&quot; ({sorted.length} kết quả)
              </span>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-lg">Không tìm thấy sản phẩm phù hợp</p>
            <p className="text-sm mt-2">Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        )}

        {/* Pagination Load More */}
        {sorted.length > 0 && (
          <div className="mt-8 text-center">
            <button className="border border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all px-8 py-2 rounded-full font-medium">
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
