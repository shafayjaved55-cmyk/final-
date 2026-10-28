"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { ImageProps } from "next/image";

type SmartImageProps = ImageProps & {
  /** Small label shown inside the fallback box. */
  fallbackLabel?: string;
};

/**
 * Drop-in replacement for next/image that never shows a broken-image icon.
 *
 * If the file is missing (e.g. binary assets weren't pushed to the hosting
 * repo) it renders a tidy branded placeholder instead. This keeps a deploy
 * looking intentional even when /public/images didn't make it up to the host.
 */
export function SmartImage({
  fallbackLabel,
  className,
  alt,
  fill,
  onError,
  ...rest
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  /** Let callers react to a missing file (e.g. TeamPhoto swaps its own UI). */
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
    onError?.(event);
  };

  if (failed) {
    return (
      <div
        role="img"
        aria-label={typeof alt === "string" ? alt : "Image unavailable"}
        className={`flex items-center justify-center gap-2 bg-gradient-to-br from-cream via-bone to-cream text-fog ${
          fill ? "absolute inset-0" : ""
        } ${className ?? ""}`}
      >
        <span className="flex flex-col items-center gap-1.5 px-3 text-center">
          <ImageOff className="h-5 w-5 shrink-0 opacity-60" />
          <span className="font-mono text-[0.62rem] font-semibold leading-tight opacity-80">
            {fallbackLabel ?? "photo coming soon"}
          </span>
        </span>
      </div>
    );
  }

  return <Image {...rest} alt={alt} fill={fill} className={className} onError={handleError} />;
}

export default SmartImage;
