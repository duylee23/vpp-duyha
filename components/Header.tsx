
import Link from 'next/link';
import { Search, ShoppingCart, User, Phone, Menu, ChevronDown } from 'lucide-react';
import { categories } from '@/lib/data';

export default function Header() {
    return (
        <header className="w-full">
            {/* Top Bar - Red */}
            <div className="bg-[#b91c1c] text-white py-3">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        {/* Placeholder for Logo */}
                        <div className="text-2xl font-bold italic bg-white text-[#b91c1c] px-2 py-1 rounded-sm transform -skew-x-12">
                            DH
                        </div>
                        <span className="text-2xl font-bold uppercase tracking-tight">VPP Duy Hà</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full h-10 px-4 pr-12 rounded bg-white text-black outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-800 dark:text-white"
                        />
                        <button className="absolute right-0 top-0 h-10 w-12 bg-[#8b1515] flex items-center justify-center rounded-r hover:bg-[#6b1010]">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Hotline */}
                        <div className="flex items-center gap-2 hidden md:flex">
                            <div className="w-8 h-8 bg-[#8b1515] rounded-full flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-xs">
                                <span className="font-bold text-base">1900 866 819</span>
                                <span className="opacity-80">Hỗ trợ khách hàng</span>
                            </div>
                        </div>

                        {/* Login/Register */}
                        <div className="flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 bg-[#8b1515] rounded-full flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col text-xs hidden md:flex">
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
                </div>
            </div>

            {/* Navigation Bar - Yellow/Cream background based on image or just White? 
         Image shows a light background for the menu items below the red header. 
         Let's use a light cream/yellow tint #fffbeb aligned with the "TL" vibe or just white.
         The provided image looks like a very light beige or white.
      */}
            <div className="bg-[#fef9e3] border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm font-medium text-gray-800 dark:text-gray-200 py-3 overflow-x-auto whitespace-nowrap gap-6 no-scrollbar">
                        {categories.map((cat, idx) => (
                            <li key={idx} className="flex items-center gap-1 cursor-pointer hover:text-[#b91c1c] transition-colors">
                                {/* Add random icons for demo */}
                                <span>{cat}</span>
                                <ChevronDown className="w-3 h-3" />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </header>
    );
}
