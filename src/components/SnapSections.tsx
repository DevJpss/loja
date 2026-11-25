"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Transforma os filhos marcados com `data-snap-section` em paradas de scroll.
 * Só ativa em telas maiores e sem prefers-reduced-motion: em mobile/reduced
 * motion o scroll continua livre e o conteúdo fica sempre visível.
 *
 * O CSS faz o encaixe (scroll-snap mandatory); aqui só acompanhamos qual seção
 * está parada para marcar `data-snap-state="active|above|below"` e permitir que
 * o wrapper interno mostre a atual nítida, a anterior distante e a próxima
 * desfocada.
 */
export default function SnapSections({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const sections = Array.from(
      current.querySelectorAll<HTMLElement>("[data-snap-section]"),
    );
    if (!sections.length) return;

    const canSnap = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    let active = -1;

    function apply(index: number) {
      if (index === active) return;
      active = index;
      sections.forEach((section, position) => {
        section.dataset.snapState =
          position === index ? "active" : position < index ? "above" : "below";
      });
    }

    function nearest() {
      // No início/fim da página o snap não consegue alinhar a seção ao topo,
      // então forçamos a primeira/última para não marcar a vizinha como ativa.
      if (window.scrollY <= 2) return 0;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        return sections.length - 1;
      }

      const root = getComputedStyle(document.documentElement);
      const offset = parseFloat(root.scrollPaddingTop) || 0;
      let best = 0;
      let distance = Number.POSITIVE_INFINITY;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const currentDistance = Math.abs(rect.top - offset);
        if (currentDistance < distance) {
          distance = currentDistance;
          best = index;
        }
      });
      return best;
    }

    function update() {
      apply(nearest());
    }

    function enable() {
      document.documentElement.classList.add("er-snap-active");
      update();
    }

    function disable() {
      document.documentElement.classList.remove("er-snap-active");
      sections.forEach((section) => {
        delete section.dataset.snapState;
      });
      active = -1;
    }

    function onPreferenceChange() {
      if (canSnap.matches) enable();
      else disable();
    }

    onPreferenceChange();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    if (canSnap.addEventListener) canSnap.addEventListener("change", onPreferenceChange);
    else canSnap.addListener(onPreferenceChange);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (canSnap.removeEventListener) canSnap.removeEventListener("change", onPreferenceChange);
      else canSnap.removeListener(onPreferenceChange);
      document.documentElement.classList.remove("er-snap-active");
      sections.forEach((section) => {
        delete section.dataset.snapState;
      });
    };
  }, []);

  return <div ref={ref} className="er-snap">{children}</div>;
}
