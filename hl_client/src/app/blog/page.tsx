"use client";

import Navbar from "@/components/Navbar2";
import Footer from "@/components/footer";
import { getBlogPosts } from "@/lib/api";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/* -------------------------------------------------
   Types (keep them in the same file or move to types/blog.ts)
   ------------------------------------------------- */
export interface BlogImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
  [k: string]: any;
}
export interface Author { name?: string; [k: string]: any; }
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string | null;
  publishedAt: string;
  coverImage: BlogImage | null;
  author: Author | null;
}

/* -------------------------------------------------
   Animation variants
   ------------------------------------------------- */
const anim = {
  container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } },
  card: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } },
};

/* -------------------------------------------------
   Helpers
   ------------------------------------------------- */
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const formatImageUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `https://blog.dreamwayhl.com${url.startsWith("/") ? "" : "/"}${url}`;
};

/* -------------------------------------------------
   BlogCard – the **only** card component
   ------------------------------------------------- */
const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const title = blog.title || "Untitled Post";
  const excerpt = blog.excerpt || blog.content.slice(0, 140) + "…";
  const date = formatDate(blog.publishedAt);
  const category = blog.category || "General";

  // ---- cover image logic (fallback → markdown → placeholder) ----
  let imgSrc = "/images/placeholder.jpg";
  if (blog.coverImage?.url) imgSrc = formatImageUrl(blog.coverImage.url);
  else if (blog.coverImage?.formats) {
    const f = blog.coverImage.formats;
    imgSrc = formatImageUrl(f.medium?.url ?? f.small?.url ?? f.thumbnail?.url ?? imgSrc);
  } else {
    const m = blog.content.match(/!\[.*?\]\((.*?)\)/);
    if (m?.[1]) imgSrc = formatImageUrl(m[1]);
  }

  return (
    <motion.article
      variants={anim.card}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-md hover:shadow-2xl transition-all duration-300"
    >
      <Link href={`/blog/${blog.slug}`} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/properties/property-hero.jpg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Text */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <time>{date}</time>
            <span>•</span>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-blue-700 dark:text-blue-300">
              {category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 flex-1">
            {excerpt}
          </p>

          <div className="mt-4 flex justify-end">
            <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              Read more
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

/* -------------------------------------------------
   Main Page
   ------------------------------------------------- */
export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image
          src="/images/properties/property-hero.jpg"
          alt="Blog hero"
          fill
          priority
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Our Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl"
          >
            Read our latest news and updates from Dreamway Holdings
          </motion.p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No blog posts found.</p>
          ) : (
            <>
              <motion.div
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                variants={anim.container}
                initial="hidden"
                animate="visible"
              >
                {blogs.map((b) => (
                  <BlogCard key={b.id} blog={b} />
                ))}
              </motion.div>

              <p className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
                Showing {blogs.length} post{blogs.length !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}