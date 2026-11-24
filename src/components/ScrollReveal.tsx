"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Intensidade do deslocamento/fade. 1 = padrão; 0,6 = mais sutil. */
  depth?: number;
  /** Atraso do amortecimento, em ms: quanto maior, mais o elemento "arrasta". */
  delay?: number;
};

const clamp = (value: number) => Math.min(1, Math.max(-1, value));

export default function ScrollReveal({
  children,
  className = "",
  depth = 1,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const strength = Math.max(0.4, Math.min(1.4, depth));
  const ease = Math.max(0.06, 0.16 - delay / 2000);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;
    const node: HTMLDivElement = current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let running = false;
    let initialized = false;
    let position = 0;
    let distance = 0;
    let targetPosition = 0;
    let targetDistance = 0;

    function write() {
      node.style.setProperty("--er-scroll", position.toFixed(4));
      node.style.setProperty("--er-distance", distance.toFixed(4));
    }

    function measure() {
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      const range = viewport / 2 + rect.height / 2;
      const raw = range > 0 ? (center - viewport / 2) / range : 0;
      targetPosition = clamp(raw);
      targetDistance = Math.abs(targetPosition);
    }

    function tick() {
      position += (targetPosition - position) * ease;
      distance += (targetDistance - distance) * ease;

      if (Math.abs(targetPosition - position) < 0.0005) position = targetPosition;
      if (Math.abs(targetDistance - distance) < 0.0005) distance = targetDistance;

      write();

      if (position !== targetPosition || distance !== targetDistance) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function schedule() {
      measure();
      if (!initialized) {
        position = targetPosition;
        distance = targetDistance;
        initialized = true;
        write();
        return;
      }
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    }

    function reset() {
      cancelAnimationFrame(frame);
      running = false;
      initialized = false;
      position = 0;
      distance = 0;
      node.style.removeProperty("--er-scroll");
      node.style.removeProperty("--er-distance");
    }

    function onMotionChange() {
      if (reduced.matches) reset();
      else schedule();
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (reduced.addEventListener) reduced.addEventListener("change", onMotionChange);
    else reduced.addListener(onMotionChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (reduced.removeEventListener) reduced.removeEventListener("change", onMotionChange);
      else reduced.removeListener(onMotionChange);
    };
  }, [ease]);

  const style = {
    "--er-shift": `${Math.round(48 * strength)}px`,
    "--er-scale": (0.045 * strength).toString(),
    "--er-rotate": `${(1 * strength).toFixed(2)}deg`,
    "--er-blur": `${(3 * strength).toFixed(1)}px`,
    "--er-fade": Math.min(0.95, 0.9 * strength).toString(),
  } as CSSProperties;

  return (
    <div ref={ref} data-scroll-reveal className={className} style={style}>
      {children}
    </div>
  );
}
