/** 렌더 검사용 next/image 대체. 속성만 그대로 <img> 로 흘린다. */
import type { ImgHTMLAttributes } from "react";

export default function Image(
  props: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
  },
) {
  // fill / priority / sizes 는 next/image 전용 속성이라 <img> 에 넘기지 않는다
  const rest = { ...props };
  delete rest.fill;
  delete rest.priority;
  delete rest.sizes;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} alt={rest.alt ?? ""} />;
}
