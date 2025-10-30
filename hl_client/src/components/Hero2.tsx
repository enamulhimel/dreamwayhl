"use client"

import { useState, useEffect } from "react"

export default function Hero() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTo, setShowTo] = useState(false)
  const [dreamwayHoldingIndex, setDreamwayHoldingIndex] = useState(-1)
  const [destinationWords, setDestinationWords] = useState<string[]>([])
  const [showButton, setShowButton] = useState(false)

  const dreamwayHolding = "Dreamway Holding"

  useEffect(() => {
    const timer1 = setTimeout(() => setShowWelcome(true), 2000)
    const timer2 = setTimeout(() => setShowTo(true), 2500)
    
    let letterInterval: NodeJS.Timeout | null = null;
    const timer3 = setTimeout(() => {
      letterInterval = setInterval(() => {
        setDreamwayHoldingIndex((prev) => {
          if (prev < dreamwayHolding.length - 1) {
            return prev + 1
          } else {
            if (letterInterval) {
              clearInterval(letterInterval)
              letterInterval = null;
            }
            return prev
          }
        })
      }, 100) // Adjust this value to change the speed of letter appearance
    }, 3000)
    
    let wordInterval: NodeJS.Timeout | null = null;
    const timer4 = setTimeout(() => {
      const words = "TO THE DESTINATION OF DREAMS".split(" ")
      let counter = 0
      wordInterval = setInterval(() => {
        if (counter < words.length) {
          setDestinationWords((prev) => [...prev, words[counter]])
          counter++
        } else {
          if (wordInterval) {
            clearInterval(wordInterval)
            wordInterval = null;
          }
          setShowButton(true)
        }
      }, 300)
    }, 5500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      if (letterInterval) {
        clearInterval(letterInterval)
      }
      if (wordInterval) {
        clearInterval(wordInterval)
      }
    }
  }, [])

  return (
    <section id="hero" className="relative h-screen">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/RO_7WOfnZ4c?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=plvrOLVdfZc"
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
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center h-full text-center text-white px-4">
        <div>
          <h1 className="text-5xl font-bold mb-4">
            <span
              className={`inline-block transition-opacity duration-500 ${showWelcome ? "opacity-100" : "opacity-0"}`}
            >
              Welcome
            </span>{" "}
            <span className={`inline-block transition-opacity duration-500 ${showTo ? "opacity-100" : "opacity-0"}`}>
              to
            </span>{" "}
            <span className="inline-block">
              {dreamwayHolding.split("").map((letter, index) => (
                <span
                  key={index}
                  className={`inline-block transition-opacity duration-300 ${index <= dreamwayHoldingIndex ? "opacity-100" : "opacity-0"}`}
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </span>
          </h1>
          <p className="text-xl mb-8 space-x-2">
            {destinationWords.map((word, index) => (
              <span key={index} className="inline-block animate-fadeIn">
                {word}
              </span>
            ))}
          </p>
          <a
            href="#projects"
            className={`inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 ${showButton ? "animate-popIn" : "opacity-0"}`}
          >
            Explore Projects
          </a>
        </div>
      </div>
    </section>
  )
}

