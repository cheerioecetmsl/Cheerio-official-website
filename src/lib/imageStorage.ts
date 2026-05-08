/**
 * Image Storage Abstraction Layer
 * Centralizes all image URL generation to eliminate hardcoded URLs.
 * Simplified to support only two formats: WebP (display) and JPG (download).
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dpy1pmz7g';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export interface ImageSource {
  webp: string;
  jpg: string;
}

/**
 * Returns URLs for the optimized WebP (display) and high-quality JPG (download).
 * We maintain the function names for backward compatibility, but they all return 
 * the same high-quality optimized source now.
 */
export const getAssetSources = (publicId: string): ImageSource => {
  if (!publicId) return { webp: "", jpg: "" };
  
  // 1. If it's already a full URL (our migrated assets), return as is.
  // This uses 0 credits!
  if (publicId.startsWith("http")) {
    return { webp: publicId, jpg: publicId };
  }

  // 2. Build URLs
  // If the publicId already has an extension, use it directly
  const hasExtension = /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i.test(publicId);
  
  if (hasExtension) {
    const url = `${BASE_URL}/image/upload/${publicId}`;
    return { webp: url, jpg: url };
  }

  // 3. Fallback to the suffix pattern (for any assets that were processed with suffixes)
  return {
    webp: `${BASE_URL}/image/upload/${publicId}_webp.webp`,
    jpg: `${BASE_URL}/image/upload/${publicId}_jpg.jpg`
  };
};

// Aliases for compatibility with existing components
export const getAvatar = getAssetSources;
export const getFaceCard = getAssetSources;
export const getGallery = getAssetSources;
export const getPreview = getAssetSources;

/**
 * For videos, we return the original secure URL.
 */
export const getVideo = (publicId: string, format: string = 'mp4'): string => {
  if (!publicId) return "";
  if (publicId.startsWith("http")) return publicId;
  return `${BASE_URL}/video/upload/${publicId}.${format}`;
};
