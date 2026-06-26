import { Suspense } from "react";
import Banner from "@/components/Banner";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import { products, getCategories } from "@/lib/data";
import { getBannerImages } from "@/lib/banner";

export default function Home() {
  const categories = getCategories();
  const bannerImages = getBannerImages();

  return (
    <div className="container mx-auto px-4 py-6">
      <Banner images={bannerImages} />

      <Suspense fallback={<div className="flex gap-8"><div className="w-64 hidden lg:block" /><div className="flex-1 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-96" /></div>}>
        <ProductGrid products={products} categories={categories} />
      </Suspense>

      {/* Customer Feedback Section */}
      <div className="mt-12">
        <Testimonials />
      </div>
    </div>
  );
}
