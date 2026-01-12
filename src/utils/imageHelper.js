import api from "../services/api";

/**
 * Parse property_images from various formats (JSON string, array, etc.)
 * @param {string|array} imagesData - The images data from property
 * @returns {array} - Parsed array of image filenames
 */
export const parsePropertyImages = (imagesData) => {
  if (!imagesData) return [];
  
  // If already an array
  if (Array.isArray(imagesData)) return imagesData;
  
  // If it's a string (JSON), try to parse it
  if (typeof imagesData === "string") {
    try {
      const parsed = JSON.parse(imagesData);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  }
  
  return [];
};

/**
 * Get the first image URL from a property
 * @param {object} property - Property object
 * @returns {string} - Full image URL
 */
export const getFirstImageUrl = (property) => {
  if (!property) return null;
  // Try different image paths in order of preference
  const imageSources = [
    () => property.images?.[0],
    () => property.property_images?.[0],
    () => property.raw?.property_images?.[0],
  ];
  
  for (const getImage of imageSources) {
    const candidate = getImage();
    if (candidate) {
      return buildImageUrl(candidate);
    }
  }
  
  return null;
};

/**
 * Get all image URLs from a property
 * @param {object} property - Property object
 * @returns {array} - Array of full image URLs
 */
export const getAllImageUrls = (property) => {
   if (!property) return [];
  const imageSources = [
    () => property.images,
    () => property.property_images,
    () => property.raw?.property_images,
  ];
  
  for (const getImages of imageSources) {
    const images = getImages();
    if (images) {
      const parsed = parsePropertyImages(images);
      if (parsed.length > 0) {
        return parsed.map(buildImageUrl);
      }
    }
  }
  
  return [];
};

/**
 * Build a full image URL from a candidate image path/filename
 * @param {string} candidate - Image filename or path
 * @returns {string} - Full image URL
 */
export const buildImageUrl = (candidate) => {
  if (!candidate) return "";
  
  // Trim whitespace
  const cleaned = candidate.trim();
  
  // Already an absolute URL
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  
  // Server-rooted path like /static/...
  if (cleaned.startsWith("/")) {
    return `${api.defaults.baseURL}${cleaned}`;
  }
  
  // Otherwise assume filename stored, build path to property_images
  return `${api.defaults.baseURL}/static/property_images/${cleaned}`;
};

/**
 * Check if a property has any images
 * @param {object} property - Property object
 * @returns {boolean}
 */
export const hasImages = (property) => {
   if (!property) return false;
  const sources = [
    () => property.images,
    () => property.property_images,
    () => property.raw?.property_images,
  ];
  
  for (const getImages of sources) {
    const images = getImages();
    if (images) {
      const parsed = parsePropertyImages(images);
      if (parsed.length > 0) return true;
    }
  }
  
  return false;
};

/**
 * Get image count for a property
 * @param {object} property - Property object
 * @returns {number}
 */
export const getImageCount = (property) => {
  if (!property) return 0;
  const sources = [
    () => property.images,
    () => property.property_images,
    () => property.raw?.property_images,
  ];
  
  for (const getImages of sources) {
    const images = getImages();
    if (images) {
      const parsed = parsePropertyImages(images);
      return parsed.length;
    }
  }
  
  return 0;
};

export default {
  parsePropertyImages,
  getFirstImageUrl,
  getAllImageUrls,
  buildImageUrl,
  hasImages,
  getImageCount,
};

