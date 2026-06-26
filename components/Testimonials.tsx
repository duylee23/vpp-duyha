import React from 'react';
import { Star, Quote } from 'lucide-react';
import { reviews } from '@/lib/reviews';

export default function Testimonials() {
    return (
        <section className="py-12 bg-white dark:bg-gray-900 mb-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4">
                {/* Section Title */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#b91c1c] mb-2 uppercase tracking-wide dark:text-red-500">
                        Khách hàng nói gì?
                    </h2>
                    <div className="w-20 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                    <p className="text-gray-500 mt-4 dark:text-gray-400 max-w-2xl mx-auto">
                        Sự hài lòng của khách hàng là động lực lớn nhất để VPP Duy Hà không ngừng hoàn thiện và phát triển.
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl relative hover:-translate-y-1 transition-transform duration-300 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md"
                        >
                            {/* Quote Icon */}
                            <div className="absolute -top-3 -left-3 bg-yellow-400 text-red-700 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                                <Quote className="w-5 h-5 fill-current" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-4 mt-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-600 dark:text-gray-300 italic mb-6 text-sm leading-relaxed min-h-[80px]">
                                "{review.content}"
                            </p>

                            {/* User Info */}
                            <div className="flex items-center gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="w-10 h-10 bg-[#b91c1c] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">{review.name}</h4>
                                    <p className="text-xs text-[#b91c1c] dark:text-red-400 font-medium">{review.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
