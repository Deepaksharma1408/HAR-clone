"use client";

import React, { useRef, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { useGsapReducedMotion } from "@/lib/motion/useReducedMotion";

interface TextMaskRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: React.ElementType;
  stagger?: number;
  once?: boolean;
}

export function TextMaskReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.95,
  as: Component = "div",
  stagger = 0.08,
  once = true,
}: TextMaskRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useGsapReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const items = el.querySelectorAll(".text-mask-inner");
    if (!items.length) {
      // If no inner items marked, animate the element itself
      gsap.fromTo(
        el,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once,
          },
        }
      );
      return;
    }

    gsap.fromTo(
      items,
      { y: "115%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [delay, duration, stagger, once, prefersReducedMotion]);

  const Tag = (Component || "div") as any;

  return (
    <Tag ref={containerRef} className={`overflow-hidden ${className}`}>
      {typeof children === "string" ? (
        <span className="text-mask-inner inline-block will-change-transform">
          {children}
        </span>
      ) : (
        children
      )}
    </Tag>
  );
}

export default TextMaskReveal;
