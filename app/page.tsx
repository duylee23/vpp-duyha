
import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";
import Sidebar from "@/components/Sidebar";
import { products } from "@/lib/data";
import { Star } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Banner />

      <div className="flex gap-8">
        <Sidebar />

        <div className="flex-1">
          {/* Section Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 uppercase">Văn phòng phẩm</h2>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>

            {/* Sort / Filter Bar */}
            <div className="bg-gray-100 p-3 rounded-md flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="font-bold text-gray-800">Sắp xếp:</span>
              <button className="hover:text-[#b91c1c] transition-colors">Tên A → Z</button>
              <button className="hover:text-[#b91c1c] transition-colors">Tên Z → A</button>
              <button className="hover:text-[#b91c1c] transition-colors">Giá tăng dần</button>
              <button className="hover:text-[#b91c1c] transition-colors">Giá giảm dần</button>
              <button className="hover:text-[#b91c1c] transition-colors font-medium text-[#b91c1c]">Hàng mới</button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* Duplicate products to fill grid for demo */}
            {products.map((product) => (
              <ProductCard key={`${product.id}-dup`} product={{ ...product, id: `${product.id}-dup` }} />
            ))}
          </div>

          {/* Pagination Load More */}
          <div className="mt-8 text-center">
            <button className="border border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all px-8 py-2 rounded-full font-medium">
              Xem thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
