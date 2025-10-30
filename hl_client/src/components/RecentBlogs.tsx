"use client";

import { fadeInUp } from "@/lib/animations";
import { getBlogPosts } from "@/lib/wordpressApi";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  coverImage?: {
    url: string;
  };
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper function to format image URL
const formatImageUrl = (url: string): string => {
  // If URL is already absolute or starts with //, return it
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }
  // Otherwise, assume it's relative to the WordPress site
  return `https://blog.dreamwayhl.com${url}`;
};

export default function RecentBlogs() {
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const blogs = await getBlogPosts();
        // Get the 3 most recent blogs
        const sortedBlogs = blogs
          .sort((a: BlogPost, b: BlogPost) => {
            return (
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
            );
          })
          .slice(0, 3);

        setRecentBlogs(sortedBlogs);
      } catch (error) {
        // Error handling without console.log
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Add intersection observer for header animation
  useEffect(() => {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const headerRefCurrent = headerRef.current;

    if (headerRefCurrent) {
      headerObserver.observe(headerRefCurrent);
    }

    return () => {
      if (headerRefCurrent) {
        headerObserver.unobserve(headerRefCurrent);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-zinc-100 to-white dark:from-stone-950 dark:to-black border-t border-zinc-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-10" ref={headerRef}>
          <motion.div
            initial="hidden"
            animate={isHeaderVisible ? "visible" : "hidden"}
            variants={fadeInUp}
            className="relative inline-block"
          >
            <h2
              className={`text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4 font-[josefinSans] transform transition-all duration-700 ease-out 
             ${
               isHeaderVisible
                 ? "translate-y-0 opacity-100"
                 : "translate-y-8 opacity-0"
             }`}
            >
              Recent Blogs
            </h2>
            <div
              className={`absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-red-600 transform transition-all duration-700 ease-out origin-center 
               ${isHeaderVisible ? "scale-x-100" : "scale-x-0"}`}
            ></div>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {recentBlogs.length === 0 && (
              <div className="col-span-3 text-center text-zinc-500 dark:text-gray-400">
                No recent blogs found.
              </div>
            )}
            {recentBlogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group block rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-black border border-zinc-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="h-48 w-full relative">
                  <Image
                    src={
                      blog.coverImage && blog.coverImage.url
                        ? formatImageUrl(blog.coverImage.url)
                        : "/images/placeholder.jpg"
                    }
                    alt={blog.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 bg-white dark:bg-black">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="text-xs text-zinc-400 dark:text-gray-500 mb-2">
                    {formatDate(blog.publishedAt)}
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-gray-300 line-clamp-3 mb-3">
                    {blog.excerpt || blog.content.slice(0, 100) + "..."}
                  </p>
                  <span className="inline-block text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
                    Read More &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
