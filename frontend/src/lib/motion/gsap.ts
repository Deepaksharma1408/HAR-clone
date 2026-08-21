"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger only on the client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Set refined editorial defaults
  gsap.defaults({
    ease: "power3.out",
    duration: 0.8,
  });

  // Optimize ScrollTrigger refresh
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });
}

export { gsap, ScrollTrigger };
export default gsap;
