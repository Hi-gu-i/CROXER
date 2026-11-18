export type { IconProps } from "./createIcon";
export { createIcon } from "./createIcon";

export { IconAi } from "./IconAi";
export { IconArrowD } from "./IconArrowD";
export { IconArrowL } from "./IconArrowL";
export { IconArrowR } from "./IconArrowR";
export { IconArrowU } from "./IconArrowU";
export { IconChange } from "./IconChange";
export { IconCheck } from "./IconCheck";
export { IconClose } from "./IconClose";
export { IconComplete } from "./IconComplete";
export { IconDefault } from "./IconDefault";
export { IconDelete } from "./IconDelete";
export { IconDocument } from "./IconDocument";
export { IconDown } from "./IconDown";
export { IconDrag } from "./IconDrag";
export { IconEdit } from "./IconEdit";
export { IconExchange } from "./IconExchange";
export { IconExpand } from "./IconExpand";
export { IconFilter } from "./IconFilter";
export { IconHamburger } from "./IconHamburger";
export { IconHome } from "./IconHome";
export { IconHoriz } from "./IconHoriz";
export { IconLeft } from "./IconLeft";
export { IconLocation } from "./IconLocation";
export { IconMic } from "./IconMic";
export { IconMore } from "./IconMore";
export { IconNoti } from "./IconNoti";
export { IconNotice } from "./IconNotice";
export { IconPerson } from "./IconPerson";
export { IconPlaying } from "./IconPlaying";
export { IconRain } from "./IconRain";
export { IconRe } from "./IconRe";
export { IconReport } from "./IconReport";
export { IconRight } from "./IconRight";
export { IconSchedule } from "./IconSchedule";
export { IconSet } from "./IconSet";
export { IconShare } from "./IconShare";
export { IconStart } from "./IconStart";
export { IconStop } from "./IconStop";
export { IconSunny } from "./IconSunny";
export { IconSymbol } from "./IconSymbol";
export { IconTime } from "./IconTime";
export { IconTogether } from "./IconTogether";
export { IconToggle } from "./IconToggle";
export { IconUp } from "./IconUp";
export { IconVerti } from "./IconVerti";

/** Icon 페이지 등록분 (이름 정렬). IconDefault 포함. */
export const iconNames = [
  "IconAi",
  "IconArrowD",
  "IconArrowL",
  "IconArrowR",
  "IconArrowU",
  "IconChange",
  "IconCheck",
  "IconClose",
  "IconComplete",
  "IconDefault",
  "IconDelete",
  "IconDocument",
  "IconDown",
  "IconDrag",
  "IconEdit",
  "IconExchange",
  "IconExpand",
  "IconFilter",
  "IconHamburger",
  "IconHome",
  "IconHoriz",
  "IconLeft",
  "IconLocation",
  "IconMic",
  "IconMore",
  "IconNoti",
  "IconNotice",
  "IconPerson",
  "IconPlaying",
  "IconRain",
  "IconRe",
  "IconReport",
  "IconRight",
  "IconSchedule",
  "IconSet",
  "IconShare",
  "IconStart",
  "IconStop",
  "IconSunny",
  "IconSymbol",
  "IconTime",
  "IconTogether",
  "IconToggle",
  "IconUp",
  "IconVerti",
] as const;

export type IconName = (typeof iconNames)[number];
