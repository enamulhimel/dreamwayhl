// "use client";

// import Navbar from "@/components/Navbar2";
// import Footer from "@/components/footer";
// import { getBlogPostBySlug, getBlogPosts } from "@/lib/wordpressApi";
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { formatImageUrl } from "@/lib/markdownComponents";



// // Helper function to process content and update image URLs
// const processContent = (content: string): string => {
//   if (!content) return '';
  
//   // Replace all img src attributes with formatted URLs
//   return content.replace(
//     /<img[^>]+src="([^"]+)"[^>]*>/g,
//     (match, src) => {
//       if (src.startsWith('http')) {
//         return match;
//       }
      
//       if (src.startsWith('//')) {
//         return match.replace(src, `https:${src}`);
//       }
      
//       const formattedSrc = formatImageUrl(src);
//       return match.replace(src, formattedSrc);
//     }
//   );
// };

// export default function BlogPostPage() {
//   const params = useParams();
//   const slug = typeof params.slug === "string" ? params.slug : "";

//   const [post, setPost] = useState<BlogPost | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);

//   useEffect(() => {
//     const fetchBlogPost = async () => {
//       try {
//         setLoading(true);
//         const data = await getBlogPostBySlug(slug);
//         if (data) {
//           if (data.coverImage && typeof data.coverImage === "object") {
//             const coverImg = data.coverImage as { id?: number; url?: string };
//             if (!coverImg.id || !coverImg.url) {
//               data.coverImage = null;
//             }
//           }
//           setPost(data as BlogPost);
//         } else {
//           setError("Blog post not found");
//         }
//         setLoading(false);
//       } catch {
//         setError("Failed to load blog post. Please try again later.");
//         setLoading(false);
//       }
//     };
//     if (slug) {
//       fetchBlogPost();
//     }
//   }, [slug]);

//   useEffect(() => {
//     const fetchRecentBlogs = async () => {
//       const blogs = await getBlogPosts();
//       const filtered = blogs
//         .filter((b: BlogPost) => b.slug !== slug)
//         .sort(
//           (a: BlogPost, b: BlogPost) =>
//             new Date(b.publishedAt).getTime() -
//             new Date(a.publishedAt).getTime()
//         )
//         .slice(0, 3);
//       setRecentBlogs(filtered);
//     };
//     fetchRecentBlogs();
//   }, [slug]);

//   // Apply styles to content after it's rendered
//   useEffect(() => {
//     if (post?.content) {
//       const contentContainer = document.querySelector('.blog-content-container');
//       if (contentContainer) {
//         const applyStyles = () => {
//           const isDark = document.documentElement.classList.contains('dark');
//           const textColor = isDark ? '#d1d5db' : '#374151';
//           const headingColor = isDark ? '#f9fafb' : '#111827';
//           const linkColor = isDark ? '#60a5fa' : '#2563eb';

//           // Style H1 elements
//           contentContainer.querySelectorAll('h1').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '2.25rem';
//             htmlEl.style.lineHeight = '2.5rem';
//             htmlEl.style.fontWeight = '700';
//             htmlEl.style.marginTop = '2rem';
//             htmlEl.style.marginBottom = '1.5rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style H2 elements
//           contentContainer.querySelectorAll('h2').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.875rem';
//             htmlEl.style.lineHeight = '2.25rem';
//             htmlEl.style.fontWeight = '700';
//             htmlEl.style.marginTop = '2rem';
//             htmlEl.style.marginBottom = '1rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style H3 elements
//           contentContainer.querySelectorAll('h3').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.5rem';
//             htmlEl.style.lineHeight = '2rem';
//             htmlEl.style.fontWeight = '600';
//             htmlEl.style.marginTop = '1.5rem';
//             htmlEl.style.marginBottom = '0.75rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style H4 elements
//           contentContainer.querySelectorAll('h4').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.25rem';
//             htmlEl.style.lineHeight = '1.75rem';
//             htmlEl.style.fontWeight = '600';
//             htmlEl.style.marginTop = '1rem';
//             htmlEl.style.marginBottom = '0.5rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style H5 elements
//           contentContainer.querySelectorAll('h5').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.125rem';
//             htmlEl.style.lineHeight = '1.75rem';
//             htmlEl.style.fontWeight = '600';
//             htmlEl.style.marginTop = '1rem';
//             htmlEl.style.marginBottom = '0.5rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style H6 elements
//           contentContainer.querySelectorAll('h6').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1rem';
//             htmlEl.style.lineHeight = '1.5rem';
//             htmlEl.style.fontWeight = '600';
//             htmlEl.style.marginTop = '1rem';
//             htmlEl.style.marginBottom = '0.5rem';
//             htmlEl.style.color = headingColor;
//           });

//           // Style paragraph elements
//           contentContainer.querySelectorAll('p').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.125rem';
//             htmlEl.style.lineHeight = '1.75rem';
//             htmlEl.style.marginBottom = '1rem';
//             htmlEl.style.color = textColor;
//           });

//           // Style strong elements
//           contentContainer.querySelectorAll('strong').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontWeight = '600';
//             htmlEl.style.color = headingColor;
//           });

//           // Style em elements
//           contentContainer.querySelectorAll('em').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontStyle = 'italic';
//           });

//           // Style anchor elements
//           contentContainer.querySelectorAll('a').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.color = linkColor;
//             htmlEl.style.textDecoration = 'underline';
//           });

//           // Style list elements
//           contentContainer.querySelectorAll('ul').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.listStyleType = 'disc';
//             htmlEl.style.paddingLeft = '1.5rem';
//             htmlEl.style.marginBottom = '1.5rem';
//           });

//           contentContainer.querySelectorAll('ol').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.listStyleType = 'decimal';
//             htmlEl.style.paddingLeft = '1.5rem';
//             htmlEl.style.marginBottom = '1.5rem';
//           });

//           contentContainer.querySelectorAll('li').forEach((el: Element) => {
//             const htmlEl = el as HTMLElement;
//             htmlEl.style.fontSize = '1.125rem';
//             htmlEl.style.lineHeight = '1.75rem';
//             htmlEl.style.marginBottom = '0.5rem';
//             htmlEl.style.color = textColor;
//           });
//         };

//         // Apply styles initially with a small delay to ensure theme is detected
//         setTimeout(applyStyles, 0);

//         // Create a MutationObserver to watch for theme changes
//         const observer = new MutationObserver((mutations) => {
//           mutations.forEach((mutation) => {
//             if (mutation.attributeName === 'class') {
//               applyStyles();
//             }
//           });
//         });

//         // Start observing the document element for class changes
//         observer.observe(document.documentElement, {
//           attributes: true,
//           attributeFilter: ['class']
//         });

//         // Also observe the content container for changes
//         const contentObserver = new MutationObserver(() => {
//           applyStyles();
//         });

//         contentObserver.observe(contentContainer, {
//           childList: true,
//           subtree: true
//         });

//         // Cleanup observers on component unmount
//         return () => {
//           observer.disconnect();
//           contentObserver.disconnect();
//         };
//       }
//     }
//   }, [post]);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-neutral-950">
//         <Navbar forceStickyBg />
//         <div className="flex justify-center items-center py-40">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-neutral-950">
//         <Navbar forceStickyBg />
//         <div className="text-center py-40">
//           <p className="text-red-500 text-lg">
//             {error || "Blog post not found"}
//           </p>
//           <button
//             onClick={() => window.history.back()}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   let imageUrl = "/images/placeholder.jpg";

//   if (post.coverImage) {
//     if (
//       typeof post.coverImage === "object" &&
//       "url" in post.coverImage &&
//       post.coverImage.url
//     ) {
//       imageUrl = formatImageUrl(post.coverImage.url);
//     }
//   } else {
//     const imgMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
//     if (imgMatch && imgMatch[1]) {
//       imageUrl = formatImageUrl(imgMatch[1]);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-neutral-950">
//       <Navbar forceStickyBg />

//       {/* Blog Title & Thumbnail Section */}
//       <section className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white pt-24 pb-4 md:pt-28 md:pb-6 overflow-hidden">
//         <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-2">
//           <div className="w-full">
//             <div className="relative w-full rounded-lg overflow-hidden shadow-lg aspect-[16/5]">
//               <Image
//                 src={imageUrl}
//                 alt={post.title || "Blog post"}
//                 fill
//                 className="object-cover"
//                 priority
//                 onError={(e) => {
//                   const target = e.target as HTMLImageElement;
//                   target.src = "/images/properties/property-hero.jpg";
//                 }}
//               />
//             </div>
//             <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-center mt-4 mb-2">
//               {post.title || "Untitled Post"}
//             </h1>
//             <div className="text-xs text-zinc-300 text-center mb-2">
//               Published on{" "}
//               {formatDate(post.publishedAt || new Date().toISOString())}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Content Section */}
//       <section className="py-16 bg-gradient-to-b from-zinc-100 dark:from-neutral-950 dark:to-slate-900">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             {/* Content container with specific class for targeting */}
//             <div 
//               className="blog-content-container"
//               dangerouslySetInnerHTML={{ __html: processContent(post.content) }} 
//             />
//           </div>
//         </div>
//       </section>

//       {/* Recent Blogs Section */}
//       <section className="py-16 bg-gradient-to-b from-zinc-100 to-white dark:from-slate-900 dark:to-neutral-950 border-t border-zinc-200 dark:border-gray-700">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center tracking-tight dark:text-white">
//             Recent Blogs
//           </h2>
//           <p className="text-zinc-500 dark:text-gray-400 text-center mb-10 max-w-2xl mx-auto">
//             Check out our latest articles and updates.
//           </p>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {recentBlogs.length === 0 && (
//               <div className="col-span-3 text-center text-zinc-500 dark:text-gray-400">
//                 No recent blogs found.
//               </div>
//             )}
//             {recentBlogs.map((blog) => (
//               <a
//                 key={blog.slug}
//                 href={`/blog/${blog.slug}`}
//                 className="group block rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-neutral-950 border border-zinc-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
//               >
//                 <div className="h-48 w-full relative">
//                   <Image
//                     src={
//                       blog.coverImage && blog.coverImage.url
//                         ? formatImageUrl(blog.coverImage.url)
//                         : "/images/placeholder.jpg"
//                     }
//                     alt={blog.title}
//                     fill
//                     className="object-cover transition-transform duration-200 group-hover:scale-105"
//                   />
//                 </div>
//                 <div className="p-5 bg-gray-100 dark:bg-black">
//                   <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
//                     {blog.title}
//                   </h3>
//                   <div className="text-xs text-zinc-400 dark:text-gray-500 mb-2">
//                     {formatDate(blog.publishedAt)}
//                   </div>
//                   <p className="text-sm text-zinc-700 dark:text-gray-300 line-clamp-3 mb-3">
//                     {blog.excerpt || blog.content.slice(0, 100) + "..."}
//                   </p>
//                   <span className="inline-block text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
//                     Read More &rarr;
//                   </span>
//                 </div>
//               </a>
//             ))}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// }


// // app/blog/[slug]/page.tsx   (or wherever your dynamic page lives)

// "use client";

// import Navbar from "@/components/Navbar2";
// import Footer from "@/components/footer";
// import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";   // <-- NEW
// import Image from "next/image";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { formatImageUrl } from "@/lib/markdownComponents";

// // ----------  KEEP ALL YOUR INTERFACES (BlogImage, Author, BlogPost) ----------

// // Helper – keep it, it still fixes relative URLs
// const processContent = (content: string): string => {
//   if (!content) return "";
//   return content.replace(
//     /<img[^>]+src="([^"]+)"[^>]*>/g,
//     (match, src) => {
//       if (src.startsWith("http")) return match;
//       if (src.startsWith("//")) return match.replace(src, `https:${src}`);
//       return match.replace(src, formatImageUrl(src));
//     }
//   );
// };

// export default function BlogPostPage() {
//   const params = useParams();
//   const slug = typeof params.slug === "string" ? params.slug : "";

//   const [post, setPost] = useState<BlogPost | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);

//   // ────── FETCH SINGLE POST ──────
//   useEffect(() => {
//     const fetchBlogPost = async () => {
//       try {
//         setLoading(true);
//         const data = await getBlogPostBySlug(slug);
//         setPost(data);
//         setLoading(false);
//       } catch (e) {
//         console.error(e);
//         setError("Failed to load blog post.");
//         setLoading(false);
//       }
//     };
//     if (slug) fetchBlogPost();
//   }, [slug]);

//   // ────── FETCH RECENT POSTS ──────
//   useEffect(() => {
//     const fetchRecent = async () => {
//       const all = await getBlogPosts();
//       const filtered = all
//         .filter((b: BlogPost) => b.slug !== slug)
//         .sort(
//           (a: BlogPost, b: BlogPost) =>
//             new Date(b.publishedAt).getTime() -
//             new Date(a.publishedAt).getTime()
//         )
//         .slice(0, 3);
//       setRecentBlogs(filtered);
//     };
//     fetchRecent();
//   }, [slug]);

//   // ────── STYLING (unchanged) ──────
//   useEffect(() => {
//     if (!post?.content) return;
//     const container = document.querySelector(".blog-content-container");
//     if (!container) return;

//     const apply = () => {
//       const dark = document.documentElement.classList.contains("dark");
//       const text = dark ? "#d1d5db" : "#374151";
//       const head = dark ? "#f9fafb" : "#111827";
//       const link = dark ? "#60a5fa" : "#2563eb";

//       container.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((el: any) => {
//         el.style.color = head;
//       });
//       container.querySelectorAll("p,li").forEach((el: any) => {
//         el.style.color = text;
//       });
//       container.querySelectorAll("a").forEach((el: any) => {
//         el.style.color = link;
//         el.style.textDecoration = "underline";
//       });
//     };
//     setTimeout(apply, 0);
//   }, [post]);

//   const formatDate = (d: string) =>
//     new Date(d).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric"
//     });

//   // ────── RENDER ──────
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-neutral-950">
//         <Navbar forceStickyBg />
//         <div className="flex justify-center items-center py-40">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error || !post) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-neutral-950">
//         <Navbar forceStickyBg />
//         <div className="text-center py-40">
//           <p className="text-red-500 text-lg">{error || "Post not found"}</p>
//           <button
//             onClick={() => window.history.back()}
//             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//           >
//             Go Back
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   // ---- cover image fallback ----
//   let imageUrl = "/images/placeholder.jpg";
//   if (post.coverImage?.url) imageUrl = formatImageUrl(post.coverImage.url);
//   else {
//     const m = post.content.match(/!\[.*?\]\((.*?)\)/);
//     if (m?.[1]) imageUrl = formatImageUrl(m[1]);
//   }

//   return (
//     <div className="min-h-screen bg-white dark:bg-neutral-950">
//       <Navbar forceStickyBg />

//       {/* Hero */}
//       <section className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white pt-24 pb-4 md:pt-28 md:pb-6 overflow-hidden">
//         <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-2">
//           <div className="relative w-full rounded-lg overflow-hidden shadow-lg aspect-[16/5]">
//             <Image
//               src={imageUrl}
//               alt={post.title}
//               fill
//               className="object-cover"
//               priority
//               onError={e => ((e.target as any).src = "/images/properties/property-hero.jpg")}
//             />
//           </div>
//           <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-center mt-4 mb-2">
//             {post.title}
//           </h1>
//           <div className="text-xs text-zinc-300 text-center mb-2">
//             Published on {formatDate(post.publishedAt)}
//           </div>
//         </div>
//       </section>

//       {/* Content */}
//       <section className="py-16 bg-gradient-to-b from-zinc-100 dark:from-neutral-950 dark:to-slate-900">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             <div
//               className="blog-content-container prose prose-lg dark:prose-invert max-w-none"
//               dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
//             />
//           </div>
//         </div>
//       </section>

//       {/* Recent Blogs */}
//       <section className="py-16 bg-gradient-to-b from-zinc-100 to-white dark:from-slate-900 dark:to-neutral-950 border-t border-zinc-200 dark:border-gray-700">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-center tracking-tight dark:text-white">
//             Recent Blogs
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
//             {recentBlogs.length === 0 ? (
//               <div className="col-span-3 text-center text-zinc-500 dark:text-gray-400">
//                 No recent blogs found.
//               </div>
//             ) : (
//               recentBlogs.map(b => (
//                 <a
//                   key={b.slug}
//                   href={`/blog/${b.slug}`}
//                   className="group block rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-neutral-950 border border-zinc-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
//                 >
//                   <div className="h-48 w-full relative">
//                     <Image
//                       src={b.coverImage?.url ? formatImageUrl(b.coverImage.url) : "/images/placeholder.jpg"}
//                       alt={b.title}
//                       fill
//                       className="object-cover transition-transform duration-200 group-hover:scale-105"
//                     />
//                   </div>
//                   <div className="p-5 bg-gray-100 dark:bg-black">
//                     <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
//                       {b.title}
//                     </h3>
//                     <div className="text-xs text-zinc-400 dark:text-gray-500 mb-2">
//                       {formatDate(b.publishedAt)}
//                     </div>
//                     <p className="text-sm text-zinc-700 dark:text-gray-300 line-clamp-3 mb-3">
//                       {b.excerpt || b.content.slice(0, 100) + "..."}
//                     </p>
//                     <span className="inline-block text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:underline">
//                       Read More
//                     </span>
//                   </div>
//                 </a>
//               ))
//             )}
//           </div>
//         </div>
//       </section>

//       <Footer />
//     </div>
//   );
// }

// app/blog/[slug]/page.tsx
"use client";

import Navbar from "@/components/Navbar2";
import Footer from "@/components/footer";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/api";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BlogPost } from "../page";


export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recent, setRecent] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      getBlogPostBySlug(slug as string),
      getBlogPosts()
    ]).then(([p, all]) => {
      setPost(p);
      setRecent(all.filter((b: { slug: string | string[]; }) => b.slug !== slug).slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="py-40 text-center">Loading...</div>;
  if (!post) return <div className="py-40 text-center text-red-500">Post not found</div>;

  const imageUrl = post.coverImage?.url || "/images/placeholder.jpg";
  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar forceStickyBg />

      {/* Hero */}
      <section className="relative h-96 bg-gradient-to-r from-zinc-900 to-zinc-800">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover opacity-70"
          priority
          onError={e => (e.target as any).src = "/images/properties/property-hero.jpg"}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{post.title}</h1>
            <p className="text-sm">Published on {date}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-neutral-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Recent Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recent.map(b => (
                <Link key={b.id} href={`/blog/${b.slug}`} className="block p-4 bg-white dark:bg-black rounded-lg shadow">
                  <Image
                    src={b.coverImage?.url || "/images/placeholder.jpg"}
                    alt={b.title}
                    width={400} height={200}
                    className="w-full h-40 object-cover rounded"
                    onError={e => (e.target as any).src = "/images/properties/property-hero.jpg"}
                  />
                  <h3 className="mt-3 font-semibold">{b.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(b.publishedAt).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}