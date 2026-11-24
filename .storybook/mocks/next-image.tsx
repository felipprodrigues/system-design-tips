import type { ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "loading"> & {
  src: string | { src: string };
  loading?: "eager" | "lazy";
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
};

const OPTIMIZER_ONLY = new Set(["priority", "fill", "quality", "placeholder", "blurDataURL", "unoptimized"]);

export default function Image({ src, alt = "", ...props }: ImageProps) {
  const imgProps = Object.fromEntries(Object.entries(props).filter(([key]) => !OPTIMIZER_ONLY.has(key)));
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={typeof src === "string" ? src : src.src} alt={alt} {...imgProps} />;
}
