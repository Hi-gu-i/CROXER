import type { ImgHTMLAttributes } from "react";

export type ResImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height" | "alt"
> & {
  /** 가로 기준. 기본 64. 세로는 56/64 비율 유지 */
  size?: number;
  title?: string;
};

/** MYA Resource ResImg 슬롯(64×56) 공통 래퍼 */
export function createResImg(displayName: string, src: string) {
  function ResImg({ size = 64, title, className, style, ...rest }: ResImgProps) {
    const height = (size * 56) / 64;
    return (
      <img
        src={src}
        width={size}
        height={height}
        alt={title ?? ""}
        className={className}
        style={style}
        draggable={false}
        {...rest}
      />
    );
  }
  ResImg.displayName = displayName;
  return ResImg;
}
