import { isPairedBodyRegion, type BodyRegion, type BodySide } from "../../bodyRegions";
import type { BodyLevel, BodyStyle } from "../model";

// The editor offers three levels (Bình thường · Hơi mỏi · Đau nhức); "Vừa" (stored level 2) stays readable for records saved earlier.
export const EDITOR_LEVELS: BodyLevel[] = ["Không khó chịu", "Nhẹ", "Nhiều"];
export const BODY_STYLES: { id: BodyStyle; label: string; image: string }[] = [
  { id: "feminine", label: "Hình thể nữ", image: "/assets/body-map-feminine-full-1024.webp" },
  { id: "masculine", label: "Hình thể nam", image: "/assets/body-map-masculine-full-1024.webp" },
  { id: "neutral", label: "Trung tính", image: "/assets/body-map-neutral-full-1024.webp" },
];
export const REGION_POSITION: Record<BodyRegion, { x: number; y: number }> = {
  neck: { x: 50, y: 18 }, shoulder: { x: 50, y: 24 },
  upper_back: { x: 50, y: 32 }, lower_back: { x: 50, y: 43 }, glute: { x: 50, y: 51 },
  upper_arm: { x: 50, y: 30 }, elbow: { x: 50, y: 41 },
  forearm_wrist: { x: 50, y: 52 }, hand: { x: 50, y: 62 },
  knee: { x: 50, y: 73 }, foot: { x: 50, y: 94 },
};
export const REGION_SIDE_OFFSET: Partial<Record<BodyRegion, number>> = {
  shoulder: 16, glute: 7, upper_arm: 20, elbow: 25, forearm_wrist: 29, hand: 27, knee: 8, foot: 7,
};
export function regionSidePosition(region: BodyRegion, side: BodySide) {
  if (side === "unspecified" || side === "both" || !isPairedBodyRegion(region)) return REGION_POSITION[region];
  const offset = REGION_SIDE_OFFSET[region] ?? 14;
  return { x: 50 + (side === "left" ? -offset : offset), y: REGION_POSITION[region].y };
}
