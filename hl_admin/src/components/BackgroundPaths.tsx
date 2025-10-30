"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

function FloatingPaths({ position, width, height }: { position: number; width: number; height: number }) {
    const numPaths = 36;
    const paths = Array.from({ length: numPaths }, (_, i) => {
        const x0 = 0 - i * 5 * position;
        const y0 = 0 + i * 6;
        const x1 = width * 0.1 - i * 5 * position;
        const y1 = height * 0.3 - i * 6;
        const x2 = width * 0.5 - i * 5 * position;
        const y2 = height * 0.5 - i * 6;
        const x3 = width * 0.9 - i * 5 * position;
        const y3 = height * 0.7 - i * 6;
        const x4 = width - i * 5 * position;
        const y4 = height - i * 6;
        return {
            id: i,
            d: `M${x0} ${y0}C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}C${x4} ${y4} ${x4} ${y4} ${x4} ${y4}`,
            color: `rgba(15,23,42,${0.1 + i * 0.03})`,
            width: 0.5 + i * 0.03,
        };
    });

    return (
        <div className="fixed inset-0 pointer-events-none">
            <svg
                className="w-screen h-screen text-slate-950 dark:text-white"
                viewBox={`0 0 ${width} ${height}`}
                width="100vw"
                height="100vh"
                fill="none"
                preserveAspectRatio="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 0,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export default function BackgroundPaths({
    title = "Dreamway Holdings Ltd",
}: {
    title?: string;
}) {
    const words = title.split(" ");
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleResize() {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            
            resizeTimeoutRef.current = setTimeout(() => {
                setDimensions({ width: window.innerWidth, height: window.innerHeight });
            }, 100);
        }
        
        handleResize();
        window.addEventListener("resize", handleResize);
        
        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-white dark:bg-neutral-950">
            <FloatingPaths position={1} width={dimensions.width} height={dimensions.height} />
            <FloatingPaths position={-1} width={dimensions.width} height={dimensions.height} />

            <div className="fixed inset-0 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="text-center"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                        dark:from-white dark:to-white/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    <div
                        className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Button
                            variant="ghost"
                            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                            text-black dark:text-white transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                            hover:shadow-md dark:hover:shadow-neutral-800/50"
                            onClick={() => window.location.href = '/login'}
                        >
                            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                Login
                            </span>
                            <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
                            >
                                →
                            </span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
