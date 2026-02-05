
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/lib/data';
import { ZaloIcon, MessengerIcon } from './icons';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const discountPercent = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            {/* Discount Badge */}
            {/* Discount Badge Removed - Contact for price */}

            {/* Image - Use placeholder if no image */}
            <div className="aspect-square relative mb-3 bg-gray-50 rounded-md overflow-hidden dark:bg-gray-800">
                {/* In a real app, use next/image with blurDataURL */}
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs dark:bg-gray-800 dark:text-gray-500">
                    {product.image.startsWith('/') ? (
                        <span className="text-4xl font-bold opacity-10">IMG</span>
                    ) : (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    )}
                </div>

                {/* Hover Action */}
                <button className="absolute bottom-2 right-2 bg-[#b91c1c] text-white p-2 rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>

            {/* Info */}
            <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">{product.brand}</div>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 h-10 leading-5 dark:text-gray-100" title={product.name}>
                    {product.name}
                </h3>

                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 dark:text-gray-400">({product.sold})</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <span className="text-[#b91c1c] font-bold text-base">Liên hệ:</span>
                    <div className="flex gap-2">
                        <button className="hover:scale-110 transition-transform" title="Liên hệ qua Zalo">
                            <ZaloIcon className="w-7 h-7" />
                        </button>
                        <button className="hover:scale-110 transition-transform" title="Liên hệ qua Messenger">
                            <MessengerIcon className="w-7 h-7 text-[#0084FF]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
