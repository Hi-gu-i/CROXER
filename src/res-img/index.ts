export type { ResImgProps } from "./createResImg";
export { createResImg } from "./createResImg";

export { ResImgCamera } from "./ResImgCamera";
export { ResImgFile } from "./ResImgFile";
export { ResImgCard } from "./ResImgCard";
export { ResImgSend } from "./ResImgSend";
export { ResImgCalendar } from "./ResImgCalendar";
export { ResImgWrite } from "./ResImgWrite";

export const resImgNames = [
  "ResImgCamera",
  "ResImgFile",
  "ResImgCard",
  "ResImgSend",
  "ResImgCalendar",
  "ResImgWrite",
] as const;

export type ResImgName = (typeof resImgNames)[number];
