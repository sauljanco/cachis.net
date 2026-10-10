import type { ImageLoaderProps } from 'next/image';

export const listingImageWidths = [160, 320, 480, 640, 800, 960, 1200, 1600] as const;

export function listingImageLoader({ src, width }: ImageLoaderProps) {
  const size = listingImageWidths.find(candidate => candidate >= width) ?? 1600;
  return src + '?w=' + size;
}
