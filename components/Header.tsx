import Link from 'next/link';
import { Suspense } from 'react';
import { ShoppingCart, User, Phone, ChevronDown } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { getCategories } from '@/lib/data';

export default function Header() {
    const categories = getCategories();

    return (
        <header className="w-full">
            {/* Top Bar - Red */}
            <div className="bg-[#b91c1c] text-white py-3">
                <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="text-2xl font-bold italic bg-white text-[#b91c1c] px-2 py-1 rounded-sm transform -skew-x-12">
                            DH
                        </div>
                        <span className="text-xl md:text-2xl font-bold uppercase tracking-tight whitespace-nowrap">VPP Duy Hà</span>
                    </Link>

                    {/* Right Actions (Mobile: Order 2 to sit next to logo, Desktop: Order 3) */}
                    <div className="flex items-center gap-3 md:gap-6 order-2 md:order-3">
                        {/* Hotline */}
                        <div className="flex items-center gap-2 hidden lg:flex">
                            <div className="w-8 h-8 bg-[#8b1515] rounded-full flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-xs">
                                <span className="font-bold text-base">0392022011</span>
                                <span className="opacity-80">Hỗ trợ khách hàng</span>
                            </div>
                        </div>

                        {/* Login/Register */}
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 bg-[#8b1515] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-xs hidden sm:flex">
                                <span className="font-bold">Đăng nhập</span>
                                <span>Đăng ký</span>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="flex items-center gap-2 cursor-pointer relative">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    0
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <Suspense fallback={<div className="w-full md:w-auto md:flex-1 max-w-2xl h-10 bg-white/20 rounded animate-pulse order-3 md:order-2" />}>
                      <SearchBar />
                    </Suspense>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-[#fef9e3] border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm font-medium text-gray-800 dark:text-gray-200 py-3 overflow-x-auto whitespace-nowrap gap-6 no-scrollbar">
                        {categories.map((cat, idx) => (
                            <li key={idx} className="flex items-center gap-1 cursor-pointer hover:text-[#b91c1c] transition-colors">
                                <Link href={`/?category=${encodeURIComponent(cat)}`} className="flex items-center gap-1">
                                    <span>{cat}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
}
