import axios from "axios";

// Create a configured instance of axios for Strapi
const strapiApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
  },
});

// Helper function to handle image URLs from Strapi
export const getStrapiMedia = (url: string | null) => {
  if (!url) return "";

  // If it's already an absolute URL, return it
  if (url.startsWith("http")) {
    return url;
  }

  // If it's a URL without protocol
  if (url.startsWith("//")) {
    const absoluteUrl = `http:${url}`;
    return absoluteUrl;
  }

  // If the URL is a relative URL, prepend the Strapi URL
  if (url.startsWith("/")) {
    const strapiUrl =
      process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
    const absoluteUrl = `${strapiUrl}${url}`;
    return absoluteUrl;
  }

  // If it's just a filename, assume it's in the uploads folder
  const strapiUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  const absoluteUrl = `${strapiUrl}/uploads/${url}`;
  return absoluteUrl;
};

// Define a type for blog post item from Strapi
interface StrapiItem {
  id?: number;
  attributes?: {
    documentId?: string;
    title?: string;
    title_bangla?: string;
    slug?: string;
    content?: string;
    content_bangla?: string;
    excerpt?: string;
    category?: string;
    publishedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    coverImage?: {
      data?: {
        id?: number;
        attributes?: {
          url?: string;
          formats?: Record<string, unknown>;
          [key: string]: unknown;
        };
      };
    };
  };
  title?: string;
  title_bangla?: string;
  content?: string;
  content_bangla?: string;
  documentId?: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  coverImage?: unknown;
  [key: string]: unknown;
}

// Blog related API functions
export const getBlogPosts = async () => {
  try {
    // Using the correct endpoint for the blog collection
    const response = await strapiApi.get("/blogs", {
      params: {
        populate: "*",
      },
    });

    const dataArray = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
      ? response.data.data
      : [];

    if (dataArray.length > 0) {
      // Transform the nested response structure to a flattened one
      const transformedData = dataArray.map((item: StrapiItem) => {
        // Check if the item has the expected structure
        const hasAttributes = item && typeof item.attributes === "object";

        // Try to get title from different possible locations
        let titleFromData = null;
        let titleBanglaFromData = null;

        if (
          hasAttributes &&
          item.attributes &&
          typeof item.attributes.title === "string"
        ) {
          titleFromData = item.attributes.title;
        } else if (typeof item.title === "string") {
          titleFromData = item.title;
        }

        if (
          hasAttributes &&
          item.attributes &&
          typeof item.attributes.title_bangla === "string"
        ) {
          titleBanglaFromData = item.attributes.title_bangla;
        } else if (typeof item.title_bangla === "string") {
          titleBanglaFromData = item.title_bangla;
        }

        // Handle coverImage properly with additional null checks
        let coverImage = null;

        if (hasAttributes && item.attributes?.coverImage?.data) {
          const imageData = item.attributes.coverImage.data;

          if (imageData.attributes) {
            coverImage = {
              id: imageData.id,
              url: imageData.attributes.url,
              formats: imageData.attributes.formats || {},
              ...imageData.attributes,
            };
          }
        } else if (item.coverImage) {
          // Try to get coverImage directly from item
          coverImage = item.coverImage;
        } else {
          // Try to extract image from content if available
          const content = hasAttributes
            ? item.attributes?.content || ""
            : item.content || "";
          const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
          if (imgMatch && imgMatch[1]) {
            coverImage = {
              id: item.id,
              url: imgMatch[1],
              name: "Extracted from content",
              alternativeText: titleFromData || "Blog image",
            };
          }
        }

        // Create a more explicit title extraction to debug issues
        let finalTitle = "Untitled Post";
        if (titleFromData) {
          finalTitle = titleFromData;
        }

        const transformedItem = {
          id: item.id || 0,
          documentId: hasAttributes
            ? item.attributes?.documentId || ""
            : item.documentId || "",
          title: finalTitle,
          title_bangla: titleBanglaFromData || "",
          slug: hasAttributes
            ? item.attributes?.slug || `post-${item.id}`
            : item.slug || `post-${item.id}`,
          content: hasAttributes
            ? item.attributes?.content || ""
            : item.content || "",
          content_bangla: hasAttributes
            ? item.attributes?.content_bangla || ""
            : item.content_bangla || "",
          excerpt: hasAttributes
            ? item.attributes?.excerpt || ""
            : item.excerpt || "",
          category: hasAttributes
            ? item.attributes?.category || "Uncategorized"
            : item.category || "Uncategorized",
          publishedAt: hasAttributes
            ? item.attributes?.publishedAt || new Date().toISOString()
            : item.publishedAt || new Date().toISOString(),
          updatedAt: hasAttributes
            ? item.attributes?.updatedAt || new Date().toISOString()
            : item.updatedAt || new Date().toISOString(),
          createdAt: hasAttributes
            ? item.attributes?.createdAt || new Date().toISOString()
            : item.createdAt || new Date().toISOString(),
          coverImage: coverImage,
          author: null, // Simplified for now
        };

        return transformedItem;
      });

      return transformedData;
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const getBlogPostBySlug = async (slug: string) => {
  try {
    // Using the correct endpoint for the blog collection
    const response = await strapiApi.get("/blogs", {
      params: {
        filters: {
          slug: {
            $eq: slug,
          },
        },
        populate: "*",
      },
    });

    const posts = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data.data)
      ? response.data.data
      : [];

    if (posts.length > 0) {
      const item: StrapiItem = posts[0];

      // Check if the item has the expected structure
      const hasAttributes = item && typeof item.attributes === "object";

      // Handle coverImage properly
      let coverImage = null;

      if (hasAttributes && item.attributes?.coverImage?.data) {
        const imageData = item.attributes.coverImage.data;
        if (imageData.attributes) {
          coverImage = {
            id: imageData.id,
            url: imageData.attributes.url,
            formats: imageData.attributes.formats || {},
            ...imageData.attributes,
          };
        }
      } else if (item.coverImage) {
        // Try to get coverImage directly from item
        coverImage = item.coverImage;
      } else {
        // Try to extract image from content if available
        const content = hasAttributes
          ? item.attributes?.content || ""
          : item.content || "";
        const imgMatch = content.match(/!\[.*?\]\((.*?)\)/);
        if (imgMatch && imgMatch[1]) {
          coverImage = {
            id: item.id,
            url: imgMatch[1],
            name: "Extracted from content",
            alternativeText: hasAttributes
              ? item.attributes?.title || "Blog image"
              : item.title || "Blog image",
          };
        }
      }

      // Try to get title from different possible locations
      let titleFromData = null;
      let titleBanglaFromData = null;

      if (
        hasAttributes &&
        item.attributes &&
        typeof item.attributes.title === "string"
      ) {
        titleFromData = item.attributes.title;
      } else if (typeof item.title === "string") {
        titleFromData = item.title;
      }

      if (
        hasAttributes &&
        item.attributes &&
        typeof item.attributes.title_bangla === "string"
      ) {
        titleBanglaFromData = item.attributes.title_bangla;
      } else if (typeof item.title_bangla === "string") {
        titleBanglaFromData = item.title_bangla;
      }

      let finalTitle = "Untitled Post";
      if (titleFromData) {
        finalTitle = titleFromData;
      }

      // Transform the nested response structure to a flattened one
      const transformedPost = {
        id: item.id || 0,
        documentId: hasAttributes
          ? item.attributes?.documentId || ""
          : item.documentId || "",
        title: finalTitle,
        title_bangla: titleBanglaFromData || "",
        slug: hasAttributes ? item.attributes?.slug || slug : item.slug || slug,
        content: hasAttributes
          ? item.attributes?.content || ""
          : item.content || "",
        content_bangla: hasAttributes
          ? item.attributes?.content_bangla || ""
          : item.content_bangla || "",
        excerpt: hasAttributes
          ? item.attributes?.excerpt || ""
          : item.excerpt || "",
        category: hasAttributes
          ? item.attributes?.category || "Uncategorized"
          : item.category || "Uncategorized",
        publishedAt: hasAttributes
          ? item.attributes?.publishedAt || new Date().toISOString()
          : item.publishedAt || new Date().toISOString(),
        updatedAt: hasAttributes
          ? item.attributes?.updatedAt || new Date().toISOString()
          : item.updatedAt || new Date().toISOString(),
        createdAt: hasAttributes
          ? item.attributes?.createdAt || new Date().toISOString()
          : item.createdAt || new Date().toISOString(),
        coverImage: coverImage,
        author: null, // Simplified for now
      };

      return transformedPost;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export default strapiApi;
