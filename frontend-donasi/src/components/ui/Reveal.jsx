import { useEffect, useRef, useState } from "react";

// Scroll-reveal halus. Tanpa IntersectionObserver atau dengan reduced-motion,
// konten langsung terlihat (aturan CSS .reveal di index.css juga menetralkan efeknya).
export default function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [terlihat, setTerlihat] = useState(
    () =>
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (terlihat) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTerlihat(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [terlihat]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${terlihat ? "is-visible" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
