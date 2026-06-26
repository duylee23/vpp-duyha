'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [value, setValue] = useState(searchParams.get('q') || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    router.push(`?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto md:flex-1 max-w-2xl relative order-3 md:order-2">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-10 px-4 pr-12 rounded bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-10 w-12 bg-[#8b1515] flex items-center justify-center rounded-r hover:bg-[#6b1010]"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
}
