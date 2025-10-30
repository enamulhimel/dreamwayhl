import axios from "axios";

// Create a configured instance of axios for WordPress API
const wordpressApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://blog.iconlifestyle.com.bd/wp-json/wp/v2",
});

// Define interfaces for WordPress API responses
interface WordPressMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    sizes?: {
      thumbnail?: { source_url: string };
      medium?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

interface WordPressAuthor {
  id: number;
  name: string;
  avatar_urls?: Record<string, string>;
}

interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  author: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    author?: WordPressAuthor[];
    "wp:featuredmedia"?: WordPressMedia[];
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

// Helper function to strip HTML tags from content
const stripHtml = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Helper function to extract excerpt from content
const extractExcerpt = (content: string, maxLength: number = 150): string => {
  const plainText = stripHtml(content);

  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength).trim() + "...";
  }

  return plainText.trim();
};

// Function to get all blog posts
export const getBlogPosts = async () => {
  try {
    // Fetch posts with embedded media, authors, and terms
    const response = await wordpressApi.get("/posts", {
      params: {
        _embed: "wp:featuredmedia,author,wp:term",
        per_page: 100, // Adjust as needed
      },
    });

    // Transform WordPress posts to match the expected BlogPost interface
    const transformedPosts = response.data.map((post: WordPressPost) => {
      // Extract featured image if available
      let coverImage = null;
      if (post._embedded && post._embedded["wp:featuredmedia"]) {
        const media = post._embedded["wp:featuredmedia"][0];
        coverImage = {
          id: media.id,
          name: media.alt_text || "",
          alternativeText: media.alt_text || null,
          caption: null,
          url: media.source_url,
          formats: media.media_details?.sizes
            ? {
                thumbnail: media.media_details.sizes.thumbnail
                  ? { url: media.media_details.sizes.thumbnail.source_url }
                  : undefined,
                small: media.media_details.sizes.medium
                  ? { url: media.media_details.sizes.medium.source_url }
                  : undefined,
                medium: media.media_details.sizes.large
                  ? { url: media.media_details.sizes.large.source_url }
                  : undefined,
                large: media.media_details.sizes.full
                  ? { url: media.media_details.sizes.full.source_url }
                  : undefined,
              }
            : undefined,
        };
      }

      // Extract author if available
      let author = null;
      if (
        post._embedded &&
        post._embedded.author &&
        post._embedded.author.length > 0
      ) {
        const authorData = post._embedded.author[0];
        author = {
          id: authorData.id,
          name: authorData.name,
        };
      }

      // Extract category if available
      let category = "Uncategorized";
      if (post._embedded && post._embedded["wp:term"]) {
        const categories = post._embedded["wp:term"][0];
        if (categories && categories.length > 0) {
          category = categories[0].name;
        }
      }

      // Create a post object that matches the expected BlogPost interface
      return {
        id: post.id,
        documentId: post.id.toString(),
        title: post.title.rendered,
        slug: post.slug,
        content: post.content.rendered,
        excerpt: post.excerpt.rendered
          ? stripHtml(post.excerpt.rendered)
          : extractExcerpt(post.content.rendered),
        category: category,
        publishedAt: post.date,
        updatedAt: post.modified,
        createdAt: post.date,
        coverImage: coverImage,
        author: author,
      };
    });

    return transformedPosts;
  } catch (error) {
    return [];
  }
};

// Function to get a single blog post by slug
export const getBlogPostBySlug = async (slug: string) => {
  try {
    const response = await wordpressApi.get("/posts", {
      params: {
        slug: slug,
        _embed: "wp:featuredmedia,author,wp:term",
      },
    });

    if (response.data.length === 0) {
      return null;
    }

    const post = response.data[0];

    // Extract featured image if available
    let coverImage = null;
    if (post._embedded && post._embedded["wp:featuredmedia"]) {
      const media = post._embedded["wp:featuredmedia"][0];
      coverImage = {
        id: media.id,
        name: media.alt_text || "",
        alternativeText: media.alt_text || null,
        caption: null,
        url: media.source_url,
        formats: media.media_details?.sizes
          ? {
              thumbnail: media.media_details.sizes.thumbnail
                ? { url: media.media_details.sizes.thumbnail.source_url }
                : undefined,
              small: media.media_details.sizes.medium
                ? { url: media.media_details.sizes.medium.source_url }
                : undefined,
              medium: media.media_details.sizes.large
                ? { url: media.media_details.sizes.large.source_url }
                : undefined,
              large: media.media_details.sizes.full
                ? { url: media.media_details.sizes.full.source_url }
                : undefined,
            }
          : undefined,
      };
    }

    // Extract author if available
    let author = null;
    if (
      post._embedded &&
      post._embedded.author &&
      post._embedded.author.length > 0
    ) {
      const authorData = post._embedded.author[0];
      author = {
        id: authorData.id,
        name: authorData.name,
      };
    }

    // Extract category if available
    let category = "Uncategorized";
    if (post._embedded && post._embedded["wp:term"]) {
      const categories = post._embedded["wp:term"][0];
      if (categories && categories.length > 0) {
        category = categories[0].name;
      }
    }

    // Create a post object that matches the expected BlogPost interface
    return {
      id: post.id,
      documentId: post.id.toString(),
      title: post.title.rendered,
      slug: post.slug,
      content: post.content.rendered,
      excerpt: post.excerpt.rendered
        ? stripHtml(post.excerpt.rendered)
        : extractExcerpt(post.content.rendered),
      category: category,
      publishedAt: post.date,
      updatedAt: post.modified,
      createdAt: post.date,
      coverImage: coverImage,
      author: author,
    };
  } catch (error) {
    return null;
  }
};
