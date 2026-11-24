"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-line/40 p-6">
        <Image
          key={current}
          src={current}
          alt={`${name} — foto ${active + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6"
          unoptimized
          priority
        />
      </div>
      {images.length > 1 ? (
        <div
          role="group"
          aria-label={`Fotos de ${name}`}
          className="mt-3 flex flex-wrap gap-2"
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver foto ${index + 1} de ${name}`}
              aria-pressed={active === index}
              className={`relative h-20 w-20 overflow-hidden border-2 bg-line/30 transition-colors ${
                active === index ? "border-accent" : "border-transparent hover:border-line"
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
