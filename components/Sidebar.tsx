
import { ChevronDown, Check } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="w-64 flex-shrink-0 hidden lg:block space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="font-bold text-[#b91c1c] text-sm uppercase mb-4">Loại sản phẩm</h3>
                <ul className="space-y-2 text-sm">
                    {['Kẹp giấy', 'Bút phấn nước', 'Dụng cụ văn phòng', 'Bấm kim & Kim bấm', 'Bìa hồ sơ'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 cursor-pointer hover:text-[#b91c1c]">
                            <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                                {/* Checkbox simulated */}
                            </div>
                            {item}
                        </li>
                    ))}
                    <li className="text-[#b91c1c] font-medium cursor-pointer text-xs mt-2 flex items-center gap-1">
                        Xem thêm <ChevronDown className="w-3 h-3" />
                    </li>
                </ul>
            </div>

            {/* Brands */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="font-bold text-[#b91c1c] text-sm uppercase mb-4">Thương hiệu</h3>
                <ul className="space-y-2 text-sm">
                    {['Thiên Long', 'FlexOffice', 'Điểm 10', 'Colokit', 'Khác'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 cursor-pointer hover:text-[#b91c1c]">
                            <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                                {i === 0 && <Check className="w-3 h-3 text-[#b91c1c]" />}
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
                <h3 className="font-bold text-[#b91c1c] text-sm uppercase mb-4">Mức giá</h3>
                <ul className="space-y-2 text-sm">
                    {['Giá dưới 100.000đ', '100.000đ - 300.000đ', '300.000đ - 500.000đ'].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 cursor-pointer hover:text-[#b91c1c]">
                            <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center"></div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
