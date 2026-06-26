
export interface Review {
    id: string;
    name: string;
    avatar?: string;
    role: string;
    content: string;
    rating: number;
}

export const reviews: Review[] = [
    {
        id: "1",
        name: "Nguyễn Thu Hà",
        role: "Giáo viên Tiểu học",
        content: "VPP Duy Hà luôn là địa chỉ tin cậy của tôi mỗi khi cần mua đồ dùng cho lớp. Giá cả rất hợp lý, giao hàng nhanh và đóng gói cẩn thận. Mực viết Thiên Long ở đây luôn mới, viết rất êm.",
        rating: 5,
    },
    {
        id: "2",
        name: "Trần Minh Tuấn",
        role: "Nhân viên Văn phòng",
        content: "Dịch vụ chăm sóc khách hàng tuyệt vời! Tôi cần gấp một lượng lớn giấy in cho công ty và shop đã hỗ trợ giao ngay trong buổi sáng. Rất hài lòng về sự chuyên nghiệp.",
        rating: 5,
    },
    {
        id: "3",
        name: "Lê Bảo Ngọc",
        role: "Sinh viên Mỹ thuật",
        content: "Đa dạng mẫu mã, đặc biệt là các loại bút vẽ và màu nước. Mình tìm mãi mới thấy shop có đủ bộ màu mình cần với giá sinh viên như vậy. Sẽ ủng hộ dài dài!",
        rating: 5,
    },
    {
        id: "4",
        name: "Phạm Văn Đức",
        role: "Chủ cửa hàng tạp hóa",
        content: "Nhập sỉ ở Duy Hà rất yên tâm. Hàng hóa nguồn gốc rõ ràng, chiết khấu tốt cho đại lý. Đã hợp tác 2 năm nay và chưa bao giờ thất vọng.",
        rating: 5,
    }
];
