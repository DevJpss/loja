"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Atraso apenas na entrada, para um efeito escalonado suave. */
  delay?: number;
};

export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // O HTML renderizado no servidor já vem visível. Sem JavaScript — ou com
  // prefers-reduced-motion — nada fica escondido.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const current = ref.current;
    if (!current || typeof IntersectionObserver === "undefined") return;
    const target: HTMLDivElement = current;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;

    function disconnect() {
      observer?.disconnect();
      observer = undefined;
    }

    function enable() {
      if (motion.matches || observer) return;
      const rect = target.getBoundingClientRect();
      setVisible(rect.bottom > 0 && rect.top < window.innerHeight * 0.92);
      observer = new IntersectionObserver(
        ([entry]) => setVisible(entry.isIntersecting),
        { rootMargin: "0px 0px -8% 0px", threshold: 0 },
      );
      observer.observe(target);
    }

    function onMotionChange() {
      if (motion.matches) {
        disconnect();
        setVisible(true);
        return;
      }
      enable();
    }

    enable();
    if (motion.addEventListener) motion.addEventListener("change", onMotionChange);
    else motion.addListener(onMotionChange);

    return () => {
      disconnect();
      if (motion.removeEventListener) motion.removeEventListener("change", onMotionChange);
      else motion.removeListener(onMotionChange);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-scroll-reveal
      data-visible={visible}
      className={className}
      style={delay ? ({ "--er-reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
