/**
 * Image Processor Utility
 * Handles client-side resizing and format conversion using the Canvas API.
 * This eliminates the need for runtime transformations on Vercel or Cloudinary.
 */

export interface ImageVariant {
  name: string;
  width: number;
  height: number;
  format: "webp" | "jpeg";
  quality: number;
}

export const IMAGE_VARIANTS: Record<string, { width: number; height: number; quality: number }> = {
  gallery: { width: 1200, height: 1500, quality: 0.85 },  // 4:5 for high-res viewing
};

/**
 * Resizes and converts an image file to a specific format and dimension.
 * Implements "object-fit: cover" logic to fill the target dimensions.
 */
export async function processImage(
  file: File | Blob,
  targetWidth: number,
  targetHeight: number,
  format: "image/webp" | "image/jpeg",
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Calculate "object-fit: cover" positioning
      const imgAspectRatio = img.width / img.height;
      const targetAspectRatio = targetWidth / targetHeight;
      
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspectRatio > targetAspectRatio) {
        // Image is wider than target - scale by height and crop sides
        drawHeight = targetHeight;
        drawWidth = img.width * (targetHeight / img.height);
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than target - scale by width and crop top/bottom
        drawWidth = targetWidth;
        drawHeight = img.height * (targetWidth / img.width);
        offsetX = 0;
        offsetY = (targetHeight - drawHeight) / 2;
      }

      // Fill background (especially for JPG fallback)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      
      // Draw image with calculated offsets
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        },
        format,
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Generates only the required WebP variant for display.
 * Returns a map of variant names to Blobs.
 */
export async function generateAllVariants(file: File | Blob): Promise<Map<string, Blob>> {
  const variants = new Map<string, Blob>();
  
  const config = IMAGE_VARIANTS.gallery;
  
  // Generate WebP for display
  const webpBlob = await processImage(
    file, 
    config.width, 
    config.height, 
    "image/webp", 
    config.quality
  );
  variants.set("gallery_webp", webpBlob);

  return variants;
}
