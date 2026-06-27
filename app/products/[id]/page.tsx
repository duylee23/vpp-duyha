'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Star, Phone, Share2 } from 'lucide-react';
import { products } from '@/lib/data';
import { ZaloIcon, MessengerIcon } from '@/components/icons';

export default function ProductDetailPage() {
  const params = useParams();
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  // Collect all available images
  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedModel, setSelectedModel] = useState<number | null>(
    product.models && product.models.length > 0 ? 0 : null
  );

  const currentModel = selectedModel !== null && product.models
    ? product.models[selectedModel]
    : null;

  // Build breadcrumb from categories
  const categories = product.categories
    ? product.categories
    : product.category
      ? [product.category]
      : [];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/" className="hover:text-[#b91c1c] dark:hover:text-red-400 transition-colors">
            Trang chủ
          </Link>
          {categories.map((cat, i) => (
            <span key={i} className="flex items-center gap-2">
              <span>/</span>
              <Link
                href={`/?category=${encodeURIComponent(cat)}`}
                className="hover:text-[#b91c1c] dark:hover:text-red-400 transition-colors"
              >
                {cat}
              </Link>
            </span>
          ))}
          <span className="flex items-center gap-2">
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </span>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column - Images */}
            <div className="lg:col-span-5 p-4 md:p-6 lg:border-r border-gray-100 dark:border-gray-700">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 group">
                <Image
                  src={allImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />

                {/* Image Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {selectedImage + 1} / {allImages.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                        i === selectedImage
                          ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - Hình ${i + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="lg:col-span-7 p-4 md:p-6 lg:p-8">
              {/* Brand */}
              {product.brand && (
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {product.brand}
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Sold */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{product.rating}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{product.sold}</span> đã bán
                </div>
              </div>

              {/* Price Section - Liên hệ */}
              <div className="bg-[#fff5f5] dark:bg-gray-700/50 rounded-lg p-4 mb-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-bold text-[#b91c1c] dark:text-red-400">Liên hệ</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">để biết giá tốt nhất</span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {product.discount && (
                      <span className="text-xs bg-[#b91c1c] text-white px-2 py-0.5 rounded-full font-medium">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Model / Variation Selector */}
              {product.models && product.models.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phân loại:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.models.map((model, i) => (
                      <button
                        key={model.model_id}
                        onClick={() => setSelectedModel(i)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                          selectedModel === i
                            ? 'border-[#b91c1c] bg-[#fff5f5] dark:bg-red-900/20 text-[#b91c1c] dark:text-red-400 shadow-sm'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                  {currentModel && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                      Giá tham khảo: {currentModel.price.toLocaleString('vi-VN')}₫
                    </p>
                  )}
                </div>
              )}

              {/* Contact Buttons */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Liên hệ mua hàng:
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="tel:0392022011"
                    className="flex items-center gap-2 bg-[#b91c1c] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#991b1b] transition-colors shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Gọi 0392022011</span>
                  </a>
                  <a
                    href="https://zalo.me/0392022011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0068FF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0052CC] transition-colors shadow-sm"
                  >
                    <ZaloIcon className="w-5 h-5" />
                    <span>Chat Zalo</span>
                  </a>
                  <a
                    href="https://www.facebook.com/mai.vu.7906"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0084FF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0073E6] transition-colors shadow-sm"
                  >
                    <MessengerIcon className="w-5 h-5" />
                    <span>Messenger</span>
                  </a>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép link sản phẩm!');
                  }
                }}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#b91c1c] dark:hover:text-red-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Description */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                Mô tả sản phẩm
              </h2>
              {product.description ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              ) : (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                  Chưa có mô tả cho sản phẩm này. Vui lòng liên hệ để biết thêm chi tiết.
                </div>
              )}

              {/* Hashtags */}
              {product.description && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.name.split(' ').filter(w => w.length > 2).slice(0, 8).map((word, i) => (
                    <span
                      key={i}
                      className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      #{word.toLowerCase().replace(/[^a-zA-ZÀ-ỹ0-9]/g, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-4">
            {/* Category Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                Danh mục
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <Link
                    key={i}
                    href={`/?category=${encodeURIComponent(cat)}`}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full hover:bg-[#b91c1c] hover:text-white dark:hover:bg-red-800 dark:hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Store Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                VPP Duy Hà
              </h3>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p>📞 Hotline: 0392022011</p>
                <p>📧 Email: vumai.ktth@gmail.com</p>
                <p>📍 Hà Nội, Việt Nam</p>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href="tel:0392022011"
                  className="flex-1 text-center bg-[#b91c1c] text-white text-sm py-2 rounded-lg hover:bg-[#991b1b] transition-colors"
                >
                  Gọi ngay
                </a>
                <a
                  href="https://zalo.me/0392022011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-[#0068FF] text-white text-sm py-2 rounded-lg hover:bg-[#0052CC] transition-colors"
                >
                  Chat Zalo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
