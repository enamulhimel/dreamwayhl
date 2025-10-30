"use client";

import { useRef } from "react";

export default function Hero() {
  const sectionRef = useRef(null);

  return (
    <section id="hero" className="relative h-screen" ref={sectionRef}>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/RO_7WOfnZ4c?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=RO_7WOfnZ4c"
          className="absolute top-0 left-0 w-full h-full"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "56.25vw",
            minHeight: "100vh",
            minWidth: "177.77vh",
            transform: "translate(-50%, -50%)",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <div className="absolute inset-0" />
      </div>
    </section>
  );
}
