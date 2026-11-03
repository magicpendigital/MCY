const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL = /(?:https?:\/\/|www\.)\S+/i;
const SOCIAL_HANDLE = /(^|\s)@[a-z0-9_]{2,}/i;
const PHONE_CANDIDATE = /\+?\d[\d\s()./-]{6,}\d/g;
const LABELED_IDENTIFIERS = /(?:^|[^\p{L}\p{N}_])(?:my\s+name|name|tên(?:\s+(?:(?:của\s+)?(?:tôi|mình)))?|address|địa\s+chỉ)\s*[:：=–-]\s*[\p{L}\d]/iu;
const ADDRESS_INTRODUCTIONS = [
  /\b(?:I\s+(?:live|stay|reside)\s+at|my\s+(?:home|house)\s+is\s+at)\s+(?:no\.?\s*)?\d{1,5}(?:[/-]\d{1,5})?\s+[\p{Lu}][\p{L}'’.-]*(?:\s+[\p{Lu}][\p{L}'’.-]*){0,3}(?=$|[,.;])/u,
  /\b(?:I\s+(?:live|stay|reside)\s+at|my\s+(?:home|house)\s+is\s+at)\s+(?:no\.?\s*)?\d{1,5}(?:[/-]\d{1,5})?\s+[\p{L}\d][\p{L}\d'’.-]*\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?|highway|hwy\.?)\b/iu,
  /\b(?:my|our)\s+(?:address|home|house)\s+(?:is\s+)?(?:at\s+)?(?:no\.?\s*)?\d{1,5}[a-z]?(?:[-/]\d{1,5}[a-z]?)?\s+[\p{L}\d][\p{L}\d'’.-]*\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?|highway|hwy\.?|court|ct\.?|circle|cir\.?|way|parkway|pkwy\.?)\b/iu,
  /\b\d{1,5}[a-z]?(?:[-/]\d{1,5}[a-z]?)?\s+[\p{L}\d][\p{L}\d'’.-]*(?:\s+[\p{L}\d][\p{L}\d'’.-]*){0,3}\s+(?:street|st\.?|road|rd\.?|avenue|ave\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?|highway|hwy\.?|court|ct\.?|circle|cir\.?|way|parkway|pkwy\.?)\b/iu,
  /\b(?:nhà\s+(?:tôi|mình|em|tớ)\s+(?:ở|tại)|(?:tôi|mình|em|tớ)(?:\s+đang)?\s+(?:ở|sống\s+(?:ở|tại)))\s+(?:số\s*)?\d{1,5}(?:[/-]\d{1,5})?\s+[\p{Lu}][\p{L}'’.-]*(?:\s+[\p{Lu}][\p{L}'’.-]*){0,3}(?=$|[,.;])/u,
  /\b\d{1,5}(?:[/-]\d{1,5})?\s+[\p{Lu}][\p{L}'’.-]*(?:\s+[\p{Lu}][\p{L}'’.-]*){0,3}\s*,\s*(?:quận|phường|huyện|thành\s+phố|thị\s+xã|tỉnh|ward|district|city|province)\b/iu,
  /\b(?:tôi|mình|em|tớ)(?:\s+đang)?\s+(?:ở|sống\s+(?:ở|tại))\s+(?:số\s*)?\d{1,5}(?:[/-]\d{1,5})?\s+(?:đường|phố|hẻm|ngõ|ngách)\s+[\p{L}\d]/iu,
  /\b\d{1,5}(?:[/-]\d{1,5})?\s+(?:đường|phố|hẻm|ngõ|ngách)\s+[\p{L}\d]/iu,
];
const NAME_INTRODUCTIONS = [
  /\b(?:tên\s+(?:tôi|mình|em|bạn)\s+(?:là\s+)?|(?:tôi|mình|em)\s+tên\s+(?:là\s+)?)[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){0,3}/iu,
  /\b(?:tôi|mình|em)\s+là\s+\p{Ll}[\p{L}'’.-]*(?:\s+\p{Ll}[\p{L}'’.-]*){2,3}/iu,
  /\b(?:Tôi|tôi|Mình|mình|Em|em)\s+là\s+\p{Lu}[\p{L}'’.-]*(?:\s+\p{Lu}[\p{L}'’.-]*){0,2}/u,
  /\b(?:my\s+(?:full\s+)?name\s+is|call\s+me)\s+[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){0,3}/iu,
  /\bI(?:'m| am)\s+[A-Z][\p{L}'’.-]*(?:\s+[A-Z][\p{L}'’.-]*){0,2}/u,
];
const LOWERCASE_ENGLISH_NAME_INTRODUCTION = /\b(?:I['’]m|I am)\s+([\p{Ll}][\p{L}'’.-]*)\s+[\p{Ll}][\p{L}'’.-]*(?=\s*(?:[,.;!?]|$))/iu;
const ENGLISH_POSSESSIVE_NAME_INTRODUCTION = /\bmy\s+name(?:\s+is|['’]s)\s+[\p{L}][\p{L}'’.-]*(?:\s+[\p{L}][\p{L}'’.-]*){0,3}/iu;
const COMMON_ENGLISH_SELF_DESCRIPTIONS = /^(?:a|an|not|very|quite|really|slightly|somewhat|just|still|so|too|more|less|always|feel|feeling|getting|doing|trying|looking|hoping|having|going|new|tired|sore|stiff|tense|fine|okay|ok|ready|well|here|there|in|on|at|beginner|experienced|unsure|curious|worried|anxious|happy|sad|concerned|comfortable|uncomfortable|relaxed|calm|sleepy|nervous|better|worse)\b/iu;

/** Detect common direct identifiers before free text is sent to an AI provider. */
export function containsDirectIdentifiers(value: string): boolean {
  if (EMAIL.test(value) || URL.test(value) || SOCIAL_HANDLE.test(value)) return true;
  if (LABELED_IDENTIFIERS.test(value)) return true;
  if (ADDRESS_INTRODUCTIONS.some(pattern => pattern.test(value))) return true;
  if (NAME_INTRODUCTIONS.some(pattern => pattern.test(value))) return true;
  if (ENGLISH_POSSESSIVE_NAME_INTRODUCTION.test(value)) return true;
  const lowercaseNameIntroduction = value.match(LOWERCASE_ENGLISH_NAME_INTRODUCTION);
  if (lowercaseNameIntroduction && !COMMON_ENGLISH_SELF_DESCRIPTIONS.test(lowercaseNameIntroduction[1])) return true;
  return [...value.matchAll(PHONE_CANDIDATE)].some(([candidate]) => {
    const digits = candidate.replace(/\D/g, "").length;
    return digits >= 8 && digits <= 15;
  });
}
