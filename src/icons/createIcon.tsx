import type { ReactNode, SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  /** 기본 24. MYA DS Icon 페이지 기준 */
  size?: number | string;
  title?: string;
};

/**
 * MYA Design System Icon 페이지(24×24) 공통 래퍼.
 * fill은 currentColor → 부모 `color` / `--color-icon-*` 토큰으로 맞춤.
 */
export function createIcon(displayName: string, children: ReactNode) {
  function Icon({
    size = 24,
    title,
    className,
    style,
    ...rest
  }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        className={className}
        style={style}
        role={title ? "img" : "presentation"}
        aria-hidden={title ? undefined : true}
        focusable="false"
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {children}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}
