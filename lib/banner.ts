import fs from 'fs';
import path from 'path';

const BANNER_DIR = path.join(process.cwd(), 'public', 'banner');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

export interface BannerImage {
  src: string;
  alt: string;
}

export function getBannerImages(): BannerImage[] {
  try {
    if (!fs.existsSync(BANNER_DIR)) return [];
    
    const files = fs.readdirSync(BANNER_DIR).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    return files.map((file) => ({
      src: `/banner/${file}`,
      alt: `Banner ${path.parse(file).name}`,
    }));
  } catch {
    return [];
  }
}
