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
 * A specialized Image component that serves WebP by default with a JPEG fallback.
 * Uses the <picture> element to avoid any server-side transformation.
 */
export const CheerioImage: React.FC<CheerioImageProps> = ({ 
  baseId, 
  fallbackUrl, 
  variant = "gallery", 
  alt = "Memory",
  className = "",
  ...props 
}) => {
  // Backward compatibility: If no baseId is provided, use the fallbackUrl (old system)
  if (!baseId && fallbackUrl) {
    return (
      <img 
        src={fallbackUrl} 
        alt={alt} 
        className={className} 
        loading={props.priority ? "eager" : "lazy"}
        {...props} 
      />
    );
  }

  if (!baseId) return null;

  const webpUrl = getVariantUrl(baseId, variant, "webp");
  const jpegUrl = getVariantUrl(baseId, variant, "jpeg");

  return (
    <picture className={className}>
      <source srcSet={webpUrl} type="image/webp" />
      <img 
        src={jpegUrl} 
        alt={alt} 
        className={className}
        loading={props.priority ? "eager" : "lazy"}
        {...props} 
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
