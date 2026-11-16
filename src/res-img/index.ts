export type { ResImgProps } from "./createResImg";
export { createResImg } from "./createResImg";

export { ResImgCamera } from "./ResImgCamera";
export { ResImgFile } from "./ResImgFile";
export { ResImgCard } from "./ResImgCard";
export { ResImgSend } from "./ResImgSend";
export { ResImgCalendar } from "./ResImgCalendar";

export const resImgNames = [
  "ResImgCamera",
  "ResImgFile",
  "ResImgCard",
  "ResImgSend",
  "ResImgCalendar",
] as const;

export type ResImgName = (typeof resImgNames)[number];
