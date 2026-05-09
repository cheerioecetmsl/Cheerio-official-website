import React from "react";
import * as storage from "./imageStorage";

export type ImageVariantName = "avatar" | "faceCard" | "gallery" | "preview";

interface CheerioImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  baseId?: string; // This is the publicId (e.g., 'profiles/user123/avatar')
  fallbackUrl?: string;
  variant?: ImageVariantName;
  priority?: boolean;
}

/**
 * A specialized Image component that serves WebP by default with a JPEG fallback.
 * Uses the <picture> element to avoid any server-side transformation.
 * Uses the new imageStorage abstraction layer.
 */
export const CheerioImage: React.FC<CheerioImageProps> = ({ 
  baseId, 
  fallbackUrl, 
  src,
  variant = "gallery", 
  alt = "Memory",
  className = "",
  priority,
  ...props 
}) => {
  // PRIORITY FIX: If src or fallbackUrl is a full URL or a local path (/), use it immediately.
  const isDirect = (s?: string) => s?.startsWith('http') || s?.startsWith('/');
  const fullUrl = (isDirect(src) ? src : null) || (isDirect(fallbackUrl) ? fallbackUrl : null);
  const id = fullUrl || baseId || src || fallbackUrl || "";

  // Get variant URLs from storage layer. 
  // Our new storage layer handles everything: full URLs, local paths, and raw IDs.
  // It also "cleans" them aggressively to fix the extension bugs you saw.
  let urls;
  switch (variant) {
    case "avatar": urls = storage.getAvatar(id); break;
    case "faceCard": urls = storage.getFaceCard(id); break;
    case "gallery": urls = storage.getGallery(id); break;
    case "preview": urls = storage.getPreview(id); break;
    default: urls = storage.getPreview(id);
  }

  return (
    <picture className={className}>
      <source srcSet={urls.webp} type="image/webp" />
      <img 
        src={urls.jpg} 
        alt={alt} 
        className={className}
        loading={priority ? "eager" : "lazy"}
        crossOrigin="anonymous"
        {...props}
        onError={(e) => {
          // Fallback to original URL if variant fails (though variants should exist)
          if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
            e.currentTarget.src = fallbackUrl;
          }
        }}
      />
    </picture>
  );
};

/**
 * Returns a variant URL for internal use (e.g., scanning).
 */
export const getVariantUrl = (
  publicId: string, 
  variant: ImageVariantName = "gallery",
  _format?: string, // Kept for compatibility
  _folder?: string  // Kept for compatibility
): string => {
  let urls;
  switch (variant) {
    case "avatar": urls = storage.getAvatar(publicId); break;
    case "faceCard": urls = storage.getFaceCard(publicId); break;
    case "gallery": urls = storage.getGallery(publicId); break;
    case "preview": urls = storage.getPreview(publicId); break;
    default: urls = storage.getPreview(publicId);
  }
  return urls.webp || urls.jpg;
};

/**
 * Helper to ensure a URL is valid for cross-origin loading.
 */
export const getProxiedUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  // If it's a public ID, resolve it
  return getVariantUrl(url, "preview");
};

/**
 * Returns the high-quality JPG URL for downloading.
 */
export const getDownloadUrl = (publicId: string): string => {
  if (!publicId) return "";
  if (publicId.startsWith("http")) return publicId;
  return storage.getAssetSources(publicId).jpg;
};
