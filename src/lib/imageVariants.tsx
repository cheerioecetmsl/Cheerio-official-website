import React from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyvobdjp5";
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export type ImageVariantName = "avatar" | "card" | "gallery" | "preview";

/**
 * Generates a direct URL to a pre-processed image variant on Cloudinary.
 * Note: These URLs do not contain any transformation parameters (w_, h_, etc.)
 * as the resizing was done client-side before upload.
 */
export function getVariantUrl(baseId: string, variant: ImageVariantName, format: "webp" | "jpeg" = "webp") {
  // Use the naming convention: Cheerio/Static/{baseId}_{variant}_{format}.{format}
  return `${BASE_URL}/Cheerio/Static/${baseId}_${variant}_${format}.${format}`;
}

interface CheerioImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  baseId?: string;
  fallbackUrl?: string; // Original URL for backward compatibility
  variant?: ImageVariantName;
  priority?: boolean;
}

/**
 * Helper to wrap external URLs (specifically Google photos) in a proxy to avoid CORS issues.
 */
export const getProxiedUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  
  // Only proxy Google photos which are known to have CORS issues with canvas
  if (url.includes("googleusercontent.com") || url.includes("lh3.googleusercontent.com")) {
    return `/api/img-proxy?url=${encodeURIComponent(url)}`;
  }
  
  return url;
};

/**
 * A specialized Image component that serves WebP by default with a JPEG fallback.
 * Uses the <picture> element to avoid any server-side transformation.
 */
export const CheerioImage: React.FC<CheerioImageProps> = ({ 
  baseId, 
  fallbackUrl, 
  src, // Support standard src prop
  variant = "gallery", 
  alt = "Memory",
  className = "",
  priority,
  ...props 
}) => {
  // Use src if provided, otherwise fallbackUrl
  const effectiveUrl = getProxiedUrl(src || fallbackUrl || "");

  // Backward compatibility: If no baseId is provided, use the effectiveUrl (old system)
  if (!baseId && effectiveUrl) {
    return (
      <img 
        src={effectiveUrl} 
        alt={alt} 
        className={className} 
        loading={priority ? "eager" : "lazy"}
        crossOrigin="anonymous"
        {...props} 
      />
    );
  }

  if (!baseId) {
    if (effectiveUrl) {
      return (
        <img 
          src={effectiveUrl} 
          alt={alt} 
          className={className} 
          loading={priority ? "eager" : "lazy"}
          crossOrigin="anonymous"
          {...props} 
        />
      );
    }
    return null;
  }

  const webpUrl = getVariantUrl(baseId, variant, "webp");
  const jpegUrl = getVariantUrl(baseId, variant, "jpeg");

  return (
    <picture className={className}>
      <source srcSet={webpUrl} type="image/webp" />
      <img 
        src={jpegUrl} 
        alt={alt} 
        className={className}
        loading={priority ? "eager" : "lazy"}
        crossOrigin="anonymous"
        {...props} 
        onError={(e) => {
          if (effectiveUrl && e.currentTarget.src !== effectiveUrl) {
            e.currentTarget.src = effectiveUrl;
          }
        }}
      />
    </picture>
  );
};

/**
 * Returns the download URL (JPG) for a specific variant.
 */
export function getDownloadUrl(baseId: string, variant: ImageVariantName = "gallery") {
  return getVariantUrl(baseId, variant, "jpeg");
}
