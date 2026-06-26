
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
        <div className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-lg transition-all duration-300 group cursor-pointer relative overflow-hidden dark:bg-gray-900 dark:border-2 dark:border-gray-700 dark:shadow-[0_4px_20px_-12px_rgba(255,255,255,0.1)]">
            {/* Discount Badge */}
            {/* Discount Badge Removed - Contact for price */}

            {/* Image */}
            <div className="aspect-square relative mb-3 bg-gray-50 rounded-md overflow-hidden dark:bg-gray-800">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    {product.image === '/placeholder.png' ? (
                        <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">IMG</span>
                    ) : (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                        />
                    )}
                </div>

                {/* Hover Action */}
                <button className="absolute bottom-2 right-2 bg-[#b91c1c] text-white p-2 rounded-full translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                    <ShoppingCart className="w-5 h-5" />
                </button>
            </div>

            {/* Info */}
            <div className="space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{product.brand}</div>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 h-10 leading-5 dark:text-gray-100 dark:font-semibold" title={product.name}>
                    {product.name}
                </h3>

                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 dark:text-gray-400 font-medium">({product.sold})</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <span className="text-[#b91c1c] dark:text-red-400 font-bold text-base">Liên hệ: 0392022011</span>
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
