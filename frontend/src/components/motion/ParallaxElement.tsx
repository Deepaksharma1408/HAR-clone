"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useGsapReducedMotion } from "@/lib/motion/useReducedMotion";

interface ParallaxElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // negative moves slower/reverse, positive moves faster
  scrub?: boolean | number;
}

export function ParallaxElement({
  children,
  className = "",
  speed = 0.2,
  scrub = 1,
}: ParallaxElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useGsapReducedMotion();

  useEffect(() => {
    const el = elementRef.current;
    if (!el || prefersReducedMotion) return;

    const yMovement = speed * 100;

    const tween = gsap.fromTo(
      el,
      { y: -yMovement / 2 },
      {
        y: yMovement / 2,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: typeof scrub === "number" ? scrub : 1,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed, scrub, prefersReducedMotion]);

  return (
    <div ref={elementRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

export default ParallaxElement;
