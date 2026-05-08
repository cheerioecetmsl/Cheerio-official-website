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
  // Use publicId if provided
  const id = baseId || src || fallbackUrl || "";

  // If it's a full URL and not a publicId, just render a standard img
  if (id.startsWith('http')) {
    return (
      <img 
        src={id} 
        alt={alt} 
        className={className} 
        loading={priority ? "eager" : "lazy"}
        crossOrigin="anonymous"
        {...props} 
      />
    );
  }

  // Get variant URLs from storage layer
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
