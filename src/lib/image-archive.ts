/**
 * Utility to archive Google profile photos to Cloudinary.
 * This prevents 429 rate-limiting issues from Google User Content.
 */

export async function archiveProfilePhoto(photoURL: string): Promise<string> {
  // Only process Google profile photos
  if (!photoURL || !photoURL.includes('googleusercontent.com')) {
    return photoURL;
  }

  try {
    // 1. Fetch the image via our server-side proxy (to bypass CORS)
    const proxyUrl = `/api/img-proxy?url=${encodeURIComponent(photoURL)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      console.warn("[archiveProfilePhoto] Proxy fetch failed, falling back to original URL");
      return photoURL;
    }

    const blob = await response.blob();

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Cheerio-2026');
    formData.append('folder', 'Cheerio/Profiles/Archived');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!cloudinaryRes.ok) {
      console.warn("[archiveProfilePhoto] Cloudinary upload failed, falling back to original URL");
      return photoURL;
    }

    const resData = await cloudinaryRes.json();
    console.log("[archiveProfilePhoto] Successfully archived to Cloudinary:", resData.secure_url);
    return resData.secure_url;

  } catch (err) {
    console.error("[archiveProfilePhoto] Error during archiving:", err);
    return photoURL;
  }
}
