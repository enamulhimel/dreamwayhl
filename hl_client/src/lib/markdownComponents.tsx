import { Components } from "react-markdown";
import Image from "next/image";

// Helper to ensure proper URL formatting for WordPress images
export const formatImageUrl = (url: string) => {
  // Check if the URL is already absolute or starts with //
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // For relative URLs, prepend the WordPress URL
  const relativePath = url.startsWith("/") ? url : `/${url}`;
  return `https://blog.dreamwayhl.com${relativePath}`;
};

// Custom components for ReactMarkdown with proper TypeScript types
export const getMarkdownComponents = (): Components => ({
  h1: (props) => (
    <h1 className="text-4xl font-bold mb-6 dark:text-white" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-3xl font-bold mt-8 mb-4 dark:text-white" {...props} />
  ),
  h3: (props) => (
    <h3
      className="text-2xl font-semibold mt-6 mb-3 dark:text-white"
      {...props}
    />
  ),
  p: (props) => <p className="text-lg mb-4 dark:text-gray-200" {...props} />,
  ul: (props) => (
    <ul
      className="list-disc pl-6 mb-6 space-y-2 dark:text-gray-200"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="list-decimal pl-6 mb-6 space-y-2 dark:text-gray-200"
      {...props}
    />
  ),
  li: (props) => <li className="text-lg dark:text-gray-200" {...props} />,
  a: (props) => (
    <a
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {props.children}
    </a>
  ),
  strong: (props) => (
    <span className="font-semibold dark:text-white" {...props} />
  ),
  img: (props) => {
    const { src, alt } = props;

    if (!src) {
      return (
        <Image
          src="/images/placeholder.jpg"
          alt={alt || "Missing image"}
          width={800}
          height={500}
          className="w-full h-auto rounded-lg my-6"
          unoptimized
        />
      );
    }

    // Format the image URL properly
    const formattedSrc = formatImageUrl(src);

    return (
      <Image
        src={formattedSrc}
        alt={alt || "Blog image"}
        width={800}
        height={500}
        className="w-full h-auto rounded-lg my-6"
        unoptimized
        onError={(e) => {
          console.error("Image failed to load:", formattedSrc);
          // Use a data attribute to detect failed loads in CSS if needed
          e.currentTarget.dataset.failed = "true";
          // Set a fallback image
          e.currentTarget.src = "/images/placeholder.jpg";
        }}
      />
    );
  },
}); 