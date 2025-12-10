import Image from "next/image";
import { ImagePropsInterface } from "@/utils/Interfaces";

export default function ImageComponent({ url, alt }: ImagePropsInterface) {
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={true}
      style={{ zIndex: 100 }}
    />
  );
}
