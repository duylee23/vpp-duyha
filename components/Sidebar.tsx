'use client';



interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriceRange: string;
  onPriceRangeChange: (range: string) => void;
}

export default function Sidebar({ categories, selectedCategory, onCategoryChange, selectedPriceRange, onPriceRangeChange }: SidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 hidden lg:block space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-[#b91c1c] text-sm uppercase mb-4">Danh mục sản phẩm</h3>
        <ul className="space-y-1 text-sm">
          <li
            onClick={() => onCategoryChange('')}
            className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-all ${
              !selectedCategory
                ? 'bg-[#b91c1c] text-white font-medium'
                : 'hover:text-[#b91c1c] dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              !selectedCategory
                ? 'border border-white'
                : 'border border-gray-300 dark:border-gray-600'
            }`}>
              {!selectedCategory && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            Tất cả
          </li>
          {categories.map((cat, i) => (
            <li
              key={i}
              onClick={() => onCategoryChange(cat)}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-all ${
                selectedCategory === cat
                  ? 'bg-[#b91c1c] text-white font-medium'
                  : 'hover:text-[#b91c1c] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${
                selectedCategory === cat
                  ? 'border border-white'
                  : 'border border-gray-300 dark:border-gray-600'
              }`}>
                {selectedCategory === cat && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="font-bold text-[#b91c1c] text-sm uppercase mb-4">Mức giá</h3>
        <ul className="space-y-1 text-sm">
          {[
            { key: 'under30', label: 'Giá dưới 30.000đ' },
            { key: '30to60', label: '30.000đ - 60.000đ' },
            { key: '60to100', label: '60.000đ - 100.000đ' },
            { key: 'over100', label: 'Trên 100.000đ' },
          ].map((item) => (
            <li
              key={item.key}
              onClick={() => onPriceRangeChange(item.key)}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-all ${
                selectedPriceRange === item.key
                  ? 'bg-[#b91c1c] text-white font-medium'
                  : 'hover:text-[#b91c1c] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${
                selectedPriceRange === item.key
                  ? 'border border-white'
                  : 'border border-gray-300 dark:border-gray-600'
              }`}>
                {selectedPriceRange === item.key && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
