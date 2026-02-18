"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "@/data/stories";

export default function StoryPlayer({ story }: { story: Story }) {
  const router = useRouter();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didHoldRef = useRef(false);

  const totalSlides = story.slides.length;
  const currentSlide = story.slides[Math.min(slideIndex, totalSlides - 1)];

  const advance = useCallback(() => {
    setSlideIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (slideIndex >= totalSlides) {
      router.push("/stories");
      return;
    }

    if (isPaused) {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      return;
    }

    advanceTimerRef.current = setTimeout(advance, 6000);
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [slideIndex, isPaused, advance, totalSlides, router]);

  const handlePointerDown = useCallback(() => {
    didHoldRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      didHoldRef.current = true;
      setIsPaused(true);
    }, 200);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (didHoldRef.current) {
      setIsPaused(false);
    } else {
      advance();
    }
  }, [advance]);

  const handlePointerLeave = useCallback(() => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (didHoldRef.current) {
      setIsPaused(false);
      didHoldRef.current = false;
    }
  }, []);

  return (
    <main
      className="relative h-dvh w-full overflow-hidden select-none flex flex-col"
      style={
        {
          background: "#000",
          "--story-play-state": isPaused ? "paused" : "running",
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Progress bars */}
      <div className="flex gap-1.5 px-4 pt-12 pb-2">
        {story.slides.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: "rgba(0,255,65,0.2)" }}
          >
            {i < slideIndex && (
              <div className="h-full w-full rounded-full" style={{ background: "#00ff41" }} />
            )}
            {i === slideIndex && (
              <div key={slideIndex} className="story-progress-fill" />
            )}
          </div>
        ))}
      </div>

      {/* Top scrolling text */}
      <div className="px-6 pt-6 overflow-hidden">
        <p
          key={`top-${slideIndex}`}
          className="story-text-top text-sm font-light text-center"
          style={{ color: "rgba(0,255,65,0.8)" }}
        >
          {currentSlide.topText}
        </p>
      </div>

      {/* Center emoji */}
      <div className="flex-1 flex items-center justify-center">
        <span
          key={`emoji-${slideIndex}`}
          className="story-emoji"
          style={{ fontSize: "96px", lineHeight: 1 }}
          aria-hidden="true"
        >
          {currentSlide.emoji}
        </span>
      </div>

      {/* Bottom scrolling text */}
      <div className="px-6 pb-4 overflow-hidden">
        <p
          key={`bottom-${slideIndex}`}
          className="story-text-bottom text-sm font-light text-center"
          style={{ color: "rgba(0,255,65,0.8)" }}
        >
          {currentSlide.bottomText}
        </p>
      </div>

      {/* Citation */}
      <div className="px-6 pb-12 flex justify-center" style={{ minHeight: "2rem" }}>
        {currentSlide.citation && (
          <a
            href={currentSlide.citation.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs underline text-center"
            style={{ color: "rgba(0,255,65,0.35)" }}
          >
            {currentSlide.citation.label}
          </a>
        )}
      </div>
    </main>
  );
}
