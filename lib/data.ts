
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  sold: number;
  discount?: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Bút bi Thiên Long TL-027",
    price: 4000,
    originalPrice: 5000,
    image: "/placeholder.png",
    category: "Bút viết",
    brand: "Thiên Long",
    rating: 5,
    sold: 1200,
    discount: 20
  },
  {
    id: "2",
    name: "Giấy A4 Double A 80gsm",
    price: 85000,
    originalPrice: 90000,
    image: "/placeholder.png",
    category: "Giấy in",
    brand: "Double A",
    rating: 4.8,
    sold: 500,
    discount: 5
  },
  {
    id: "3",
    name: "Thước kẻ Thiên Long 20cm",
    price: 5000,
    image: "/placeholder.png",
    category: "Dụng cụ học tập",
    brand: "Thiên Long",
    rating: 4.5,
    sold: 300
  },
  {
    id: "4",
    name: "Bìa còng KingJim 7cm",
    price: 45000,
    originalPrice: 50000,
    image: "/placeholder.png",
    category: "Lưu trữ",
    brand: "KingJim",
    rating: 4.9,
    sold: 150,
    discount: 10
  }
];

export const categories = [
  "Bút viết",
  "Văn phòng phẩm",
  "Dụng Cụ Học Tập",
  "Mỹ Thuật",
  "Giấy In",
  "Bút cao cấp",
  "Sports - Lifestyle"
];
