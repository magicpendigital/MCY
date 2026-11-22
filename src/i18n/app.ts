// Brand name and slogan (header, welcome). Data only: msg(), overrides and the key type stay in src/i18n.ts.
export const viApp = {
  "brand.name": "Một chút yoga",
  "brand.slogan": "Vạn chút an yên",
  "brand.sloganNote": "",
} as const;

export const enApp: Record<keyof typeof viApp, string> = {
  "brand.name": "A Little Yoga",
  "brand.slogan": "A little more peace",
  "brand.sloganNote": "ENGLISH PREVIEW · SOME SCREENS REMAIN IN VIETNAMESE",
};
