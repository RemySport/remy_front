"use client";

import { useState } from "react";

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <span
        aria-hidden={alt === ""}
        className={`flex items-center justify-center bg-[#EEEEEE] text-soft ${fallbackClassName ?? className ?? ""}`}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />
  );
}
