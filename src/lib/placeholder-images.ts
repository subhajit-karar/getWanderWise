import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type ImageCategory = 'restaurants' | 'hotels' | 'attractions' | 'shops';

export const placeHolderImages: ImagePlaceholder[] = data.placeholderImages;

export function getPlaceholderImage(id: ImageCategory): ImagePlaceholder | undefined {
  return placeHolderImages.find(img => img.id === id);
}
