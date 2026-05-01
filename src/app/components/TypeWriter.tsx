"use client";

import { useEffect, useRef, useState } from "react";

interface TypeWriterProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TypeWriter({
  text,
  speed = 60,
  className,
}: TypeWriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || count >= text.length) return;

    const timer = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(timer);
  }, [started, count, text.length, speed]);

  return (
    <span ref={ref} className={className}>
      {started ? text.slice(0, count) : "\u00A0"}
      {started && count < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  );
}
