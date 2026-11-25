import { viApp, enApp } from "./i18n/app";
import { viWelcome, enWelcome } from "./i18n/welcome";
import { viCheckin, enCheckin, regionLabels, levelLabels, sideLabels } from "./i18n/checkin";
import { viDialogue, enDialogue } from "./i18n/dialogue";
import { viReflection, enReflection } from "./i18n/reflection";
import { viJourney, enJourney } from "./i18n/journey";
import { viDiscover, enDiscover } from "./i18n/discover";

export type AppLocale = "vi-VN" | "en-US";

const vi = {
  ...viApp,
  ...viWelcome,
  ...viCheckin,
  ...viDialogue,
  ...viReflection,
  ...viJourney,
  ...viDiscover,
} as const;

const en: Record<keyof typeof vi, string> = {
  ...enApp,
  ...enWelcome,
  ...enCheckin,
  ...enDialogue,
  ...enReflection,
  ...enJourney,
  ...enDiscover,
};

const messages = { "vi-VN": vi, "en-US": en } as const;
export type MessageKey = keyof typeof vi;

// Replacement texts from the published content snapshot. Only keys on the unlocked allow-list ever get here (contentSnapshot.ts
// checks that); every other text is locked in this file. Empty until a snapshot says otherwise, so the bundled text is the default.
let screenOverrides: Partial<Record<AppLocale, Record<string, string>>> = {};
export function setScreenOverrides(next: Partial<Record<AppLocale, Record<string, string>>>): void {
  screenOverrides = next;
}

export function msg(locale: AppLocale, key: MessageKey): string {
  const own = screenOverrides[locale];
  return (own && Object.prototype.hasOwnProperty.call(own, key) ? own[key] : undefined) ?? messages[locale][key];
}

export function regionLabel(locale: AppLocale, value: string): string {
  return regionLabels[locale][value] ?? value;
}

const guidedChoiceLabels: Record<AppLocale, Record<string, string>> = {
  "vi-VN": { "Nhiều hướng dẫn": "Nhiều hướng dẫn", "Nhịp chậm": "Nhịp chậm", "Ít lời": "Ít lời", "Không nằm sàn": "Không nằm sàn", "Dễ chịu hơn": "Dễ chịu hơn", "Như cũ": "Như cũ", "Khó chịu hơn": "Khó chịu hơn", "Chưa rõ": "Chưa rõ", "Vừa": "Vừa", "Hơi nhanh": "Hơi nhanh", "Hơi chậm": "Hơi chậm" },
  "en-US": { "Nhiều hướng dẫn": "More guidance", "Nhịp chậm": "Slower pace", "Ít lời": "Fewer words", "Không nằm sàn": "No floor work", "Dễ chịu hơn": "Better", "Như cũ": "Unchanged", "Khó chịu hơn": "Worse", "Chưa rõ": "Unsure", "Vừa": "About right", "Hơi nhanh": "A little fast", "Hơi chậm": "A little slow" },
};

export function bodyLevelLabel(locale: AppLocale, value: string): string {
  return levelLabels[locale][value] ?? value;
}

export function sideLabel(locale: AppLocale, value: string): string {
  return sideLabels[locale][value] ?? value;
}

export function guidedChoiceLabel(locale: AppLocale, value: string): string {
  return guidedChoiceLabels[locale][value] ?? value;
}

export function formatMessage(locale: AppLocale, key: MessageKey, values: Record<string, string | number>): string {
  return msg(locale, key).replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
}

export function localizedNumber(locale: AppLocale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}
