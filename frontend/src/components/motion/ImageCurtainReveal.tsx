"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useGsapReducedMotion } from "@/lib/motion/useReducedMotion";

interface ImageCurtainRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  scaleStart?: number;
}

export function ImageCurtainReveal({
  children,
  className = "",
  delay = 0,
  duration = 1.1,
  direction = "up",
  scaleStart = 1.1,
}: ImageCurtainRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useGsapReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prefersReducedMotion) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 });
      const img = el.querySelector("img");
      if (img) gsap.set(img, { scale: 1 });
      return;
    }

    const clipPaths = {
      up: { from: "inset(100% 0% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
      down: { from: "inset(0% 0% 100% 0%)", to: "inset(0% 0% 0% 0%)" },
      left: { from: "inset(0% 0% 0% 100%)", to: "inset(0% 0% 0% 0%)" },
      right: { from: "inset(0% 100% 0% 0%)", to: "inset(0% 0% 0% 0%)" },
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });

    tl.fromTo(
      el,
      {
        clipPath: clipPaths[direction].from,
        opacity: 0.4,
      },
      {
        clipPath: clipPaths[direction].to,
        opacity: 1,
        duration,
        delay,
        ease: "power3.inOut",
      }
    );

    const img = el.querySelector("img");
    if (img) {
      tl.fromTo(
        img,
        { scale: scaleStart },
        {
          scale: 1,
          duration: duration * 1.15,
          ease: "power2.out",
        },
        0
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay, duration, direction, scaleStart, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden will-change-[clip-path,transform] ${className}`}
      style={{ clipPath: "inset(100% 0% 0% 0%)" }}
    >
      {children}
    </div>
  );
}

export default ImageCurtainReveal;
