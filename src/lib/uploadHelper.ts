import { generateAllVariants } from "./imageProcessor";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyvobdjp5";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Cheerio-2026";
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export interface UploadResult {
  baseId: string;
  version: number;
}

/**
 * Orchestrates the processing and uploading of all 8 image variants.
 * Returns the baseId used for the variants.
 */
export async function uploadProcessedImage(
  file: File | Blob,
  subfolder: string = "General",
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const baseId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const variants = await generateAllVariants(file);
  const totalVariants = variants.size;
  let completed = 0;
  let lastVersion = 0;

  // We upload them sequentially to avoid overloading the browser/network
  for (const [name, blob] of variants.entries()) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    // public_id convention: Cheerio/Static/{subfolder}/{baseId}_{variantName}
    formData.append("public_id", `${baseId}_${name}`);
    formData.append("folder", `Cheerio/Static/${subfolder}`);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Cloudinary Upload Error for ${name}:`, error);
      throw new Error(`Failed to upload variant ${name}: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    lastVersion = result.version;
    
    completed++;
    if (onProgress) {
      onProgress(Math.round((completed / totalVariants) * 100));
    }
  }

  return { baseId, version: lastVersion };
}

/**
 * Convenience function for profile photos (which only need the 'avatar' variant ideally, 
 * but for consistency we'll use the same 8-variant pipeline or a subset).
 * The user wants to eliminate ALL transformations, so having a high-res 'gallery' variant
 * for profile photos is also good if they are ever viewed full-screen.
 */
export const uploadProfilePhoto = uploadProcessedImage;
