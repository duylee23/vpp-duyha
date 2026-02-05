
export default function Banner() {
    return (
        <div className="w-full relative h-[300px] md:h-[400px] bg-gradient-to-r from-orange-400 to-yellow-300 rounded-2xl overflow-hidden flex items-center mb-8">
            {/* Background Graphic elements simulated */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

            <div className="container mx-auto px-12 relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 text-white space-y-4">
                    <div className="bg-blue-600 inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-2">
                        VPP Duy Hà
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-md">
                        KHỞI ĐẦU NĂM MỚI <br />
                        <span className="text-white">CÔNG VIỆC PHƠI PHỚI</span>
                    </h2>
                    <div className="flex gap-4 pt-4">
                        <div className="bg-[#5da035] px-6 py-2 rounded-full font-bold text-2xl shadow-lg border-2 border-white">
                            GIẢM <br /> <span className="text-xs font-normal">ĐẾN</span> 50%
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                            <span>🏷️</span> ÁP THÊM VOUCHER
                        </button>
                    </div>
                </div>

                {/* Right side illustration placeholder which would be stationery products */}
                <div className="hidden md:block md:w-1/2 relative h-[300px]">
                    {/* This would be an image of pens, calculators etc */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center">
                        <span className="text-white/80 font-bold text-center">Stationery <br /> Image Place</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
