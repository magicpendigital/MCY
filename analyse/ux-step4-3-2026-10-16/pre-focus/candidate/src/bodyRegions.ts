export type BodyRegion =
  | "neck"
  | "shoulder"
  | "upper_arm"
  | "elbow"
  | "forearm_wrist"
  | "hand"
  | "upper_back"
  | "lower_back"
  | "knee"
  | "foot";

export type BodySide = "unspecified" | "left" | "right" | "both";
export type BodyRegionGroup = "trunk" | "arms" | "legs";

export type BodyRegionCode =
  | "neck"
  | "upper_back"
  | "lower_back"
  | "shoulder_left" | "shoulder_right" | "shoulder_unspecified"
  | "upper_arm_left" | "upper_arm_right" | "upper_arm_unspecified"
  | "elbow_left" | "elbow_right" | "elbow_unspecified"
  | "forearm_wrist_left" | "forearm_wrist_right" | "forearm_wrist_unspecified"
  | "hand_left" | "hand_right" | "hand_unspecified"
  | "knee_left" | "knee_right" | "knee_unspecified"
  | "foot_left" | "foot_right" | "foot_unspecified";

export const BODY_REGIONS: readonly BodyRegion[] = [
  "neck", "shoulder", "upper_back", "lower_back",
  "upper_arm", "elbow", "forearm_wrist", "hand", "knee", "foot",
];

export const BODY_REGION_GROUPS: Readonly<Record<BodyRegionGroup, readonly BodyRegion[]>> = {
  trunk: ["neck", "shoulder", "upper_back", "lower_back"],
  arms: ["upper_arm", "elbow", "forearm_wrist", "hand"],
  legs: ["knee", "foot"],
};

const pairedRegions = new Set<BodyRegion>([
  "shoulder", "upper_arm", "elbow", "forearm_wrist", "hand", "knee", "foot",
]);

export function isPairedBodyRegion(region: BodyRegion): boolean {
  return pairedRegions.has(region);
}

export function bodyRegionCodes(region: BodyRegion, side: BodySide): BodyRegionCode[] {
  if (!isPairedBodyRegion(region)) return [region as BodyRegionCode];
  if (side === "both") return [`${region}_left` as BodyRegionCode, `${region}_right` as BodyRegionCode];
  return [`${region}_${side}` as BodyRegionCode];
}

export function decodeBodyRegionCode(code: string): { region: BodyRegion; side: BodySide } | null {
  if (code === "neck" || code === "upper_back" || code === "lower_back") {
    return { region: code, side: "unspecified" };
  }
  for (const region of pairedRegions) {
    if (code === `${region}_left`) return { region, side: "left" };
    if (code === `${region}_right`) return { region, side: "right" };
    if (code === `${region}_unspecified`) return { region, side: "unspecified" };
  }
  return null;
}

export function replaceBodyObservation<T extends { region: BodyRegion; side: BodySide }>(
  observations: readonly T[],
  value: T,
  previousSide: BodySide = value.side,
): T[] {
  const clearRegion = !isPairedBodyRegion(value.region)
    || value.side === "both" || value.side === "unspecified"
    || previousSide === "both" || previousSide === "unspecified";
  return [
    ...observations.filter(item => item.region !== value.region
      || (!clearRegion && item.side !== previousSide && item.side !== value.side)),
    value,
  ];
}

export function removeBodyObservation<T extends { region: BodyRegion; side: BodySide }>(
  observations: readonly T[],
  region: BodyRegion,
  side: BodySide,
): T[] {
  return observations.filter(item => item.region !== region
    || (isPairedBodyRegion(region) && side !== "both" && side !== "unspecified" && item.side !== side));
}
