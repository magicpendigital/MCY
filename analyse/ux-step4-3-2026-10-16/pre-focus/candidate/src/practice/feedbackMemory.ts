type Feedback = { kind: string; pace?: string | null; outcome?: string | null; endedEarly?: boolean; feedbackSkipped?: boolean };
/** Only the latest actual feedback may inform an explicitly confirmed new choice. */
export function rememberedPace<T extends Feedback>(history: T[], allowed: boolean): T | undefined {
  if (!allowed) return undefined;
  const latest = [...history].reverse().find(item => item.kind === "Sau tập");
  return latest && !latest.feedbackSkipped && !latest.endedEarly && latest.outcome !== "Khó chịu hơn"
    && latest.outcome !== "Chưa rõ" && latest.outcome != null && latest.pace === "Hơi nhanh" ? latest : undefined;
}
