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
/**
 * Cleans an ID or URL by removing ALL extensions and redundant suffixes.
 * This prevents the "image_webp_webp.webp" bug.
 */
const getCleanBaseId = (id: string): string => {
  if (!id) return "";
  
  // 1. If it's a full Cloudinary URL, extract the part after /upload/
  let clean = id;
  if (id.includes("/upload/")) {
    clean = id.split("/upload/")[1];
    // Remove the version number (e.g., v12345678/)
    clean = clean.replace(/^v\d+\//, "");
  }

  // 2. Aggressively strip extensions and common redundant suffixes
  // We do this in a loop to catch "image.jpg.webp" or "image_webp_webp"
  const patternsToStrip = [
    /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i,
    /_(webp|jpg|png|jpeg|original|gallery|card|preview)$/i,
    /_(webp|jpg|png|jpeg|original|gallery|card|preview)$/i, // Repeat to catch double suffixes
  ];

  let previous;
  do {
    previous = clean;
    patternsToStrip.forEach(pattern => {
      clean = clean.replace(pattern, "");
    });
  } while (clean !== previous);

  return clean;
};

export const getAssetSources = (publicId: string): ImageSource => {
  if (!publicId) return { webp: "", jpg: "" };
  
  // Local paths (public folder) stay as they are
  if (publicId.startsWith("/")) {
    return { webp: publicId, jpg: publicId };
  }

  // For everything else (Cloudinary IDs or Full URLs), we normalize them
  const cleanId = getCleanBaseId(publicId);
  const folderPath = publicId.includes("Cheerio/") 
    ? publicId.split("/upload/")[1]?.replace(/^v\d+\//, "").split("/").slice(0, -1).join("/") || "Cheerio/Archives/Images"
    : "Cheerio/Archives/Images";

  // Rebuild the URL using the clean ID. 
  // Cloudinary will serve the image correctly as long as the base ID is right.
  const finalPath = folderPath ? `${folderPath}/${cleanId}` : cleanId;

  return {
    webp: `${BASE_URL}/image/upload/${finalPath}.webp`,
    jpg: `${BASE_URL}/image/upload/${finalPath}.jpg`
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
