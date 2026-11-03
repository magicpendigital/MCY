const MEDICAL_DIAGNOSIS_CLAIMS = [
  /\b(?:you|your body)\s+(?:may|might|could|probably|likely)?\s*(?:have|suffer from|be suffering from)\s+(?:an?\s+)?(?:sciatica|arthritis|a herniated disc|disc herniation|a pinched nerve|tendonitis|osteoporosis|scoliosis|a muscle tear|an injury)\b/i,
  /(?:^|[^\p{L}])(?:bạn|cơ thể bạn)\s+(?:có thể\s+)?(?:đang\s+)?(?:bị|mắc)\s+(?:đau thần kinh tọa|thoát vị đĩa đệm|thoát vị|viêm khớp|chèn ép dây thần kinh|viêm gân|loãng xương|vẹo cột sống|rách cơ|chấn thương)(?!\p{L})/iu,
  /\b(?:this|that)\s+(?:is|sounds like|looks like)\s+(?:sciatica|arthritis|a herniated disc|disc herniation|a pinched nerve|tendonitis|an injury)\b/i,
  /(?:^|[^\p{L}])(?:đây|đó)\s+(?:là|có vẻ là)\s+(?:đau thần kinh tọa|thoát vị đĩa đệm|viêm khớp|chèn ép dây thần kinh|viêm gân|chấn thương)(?!\p{L})/iu,
];

const MOVEMENT_PRESCRIPTIONS = [
  /\b(?:try|do|perform|hold|repeat|practice|start with|move into)\s+(?:the\s+)?(?:[\p{L}'’.-]+\s+){0,3}(?:pose|asana|stretch|stretches|exercise|exercises|movement|sequence)\b/iu,
  /\b(?:child['’]?s pose|downward[- ]facing dog|downward dog|cobra pose|cat[- ]cow|warrior [i1-3])\b/iu,
  /(?:^|[^\p{L}])(?:hãy|nên|thử|tập|thực hiện|giữ|lặp lại)(?!\p{L}).{0,55}(?:^|[^\p{L}])(?:tư thế|động tác|bài tập|chuỗi yoga|kéo giãn)(?!\p{L})/iu,
];

const TREATMENT_CLAIMS = [
  /\b(?:yoga|a pose|this movement|this exercise)\b.{0,55}\b(?:cure|treat|heal|fix|prevent|relieve|reduce)\b.{0,45}\b(?:pain|injury|condition|sciatica|arthritis|back|neck|shoulder)\b/iu,
  /(?:^|[^\p{L}])(?:yoga|tư thế|động tác|bài tập)(?!\p{L}).{0,55}(?:^|[^\p{L}])(?:chữa khỏi|điều trị|chữa|trị|giảm đau|hết đau)(?!\p{L})/iu,
  /\b(?:you should|you need to|take)\s+(?:painkillers|medication|medicine|anti-inflammatory drugs)\b/iu,
  /\b(?:bạn nên|hãy)\s+(?:uống|dùng)\s+(?:thuốc|thuốc giảm đau)\b/iu,
];

/** Conservative guard for obvious unsafe medical claims and movement prescriptions. */
export function containsUnsafeMedicalAdvice(value: string): boolean {
  return [...MEDICAL_DIAGNOSIS_CLAIMS, ...MOVEMENT_PRESCRIPTIONS, ...TREATMENT_CLAIMS]
    .some(pattern => pattern.test(value));
}
