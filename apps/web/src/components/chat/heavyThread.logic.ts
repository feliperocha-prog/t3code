/** How far context has to grow past a dismissal before the notice comes back. */
export const HEAVY_NOTICE_REARM_POINTS = 10;

/**
 * Whether the composer should suggest a fresh thread. `threshold` 0 turns the
 * notice off; a dismissal holds until usage climbs another ten points.
 */
export function shouldShowHeavyNotice(input: {
  usedPercentage: number | null;
  threshold: number;
  dismissedAtPercent: number | null;
}): boolean {
  const { usedPercentage: used, threshold, dismissedAtPercent } = input;
  if (used === null || !Number.isFinite(used)) return false;
  return (
    threshold > 0 &&
    used >= threshold &&
    (dismissedAtPercent === null || used >= dismissedAtPercent + HEAVY_NOTICE_REARM_POINTS)
  );
}
