
export default function Footer() {
    return (
        <footer className="bg-gray-100 mt-12 py-8 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-[#b91c1c]">VPP Duy Hà</h3>
                        <p className="text-sm text-gray-600">
                            Chuyên cung cấp văn phòng phẩm, dụng cụ học sinh chất lượng cao.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Hỗ trợ khách hàng</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>Hướng dẫn mua hàng</li>
                            <li>Chính sách giao hàng</li>
                            <li>Chính sách bảo mật</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Liên hệ</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li>Hotline: 1900 866 819</li>
                            <li>Email: support@duyha.com</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Theo dõi chúng tôi</h4>
                        <div className="flex gap-2">
                            {/* Social icons placeholder */}
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-8 pt-8 border-t border-gray-200">
                    © 2026 VPP Duy Hà. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
