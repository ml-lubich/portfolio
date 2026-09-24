import { ossDemos, type OssDemo } from "@/data/oss-demos"
import type { Line } from "@/components/terminal/types"

/** id of the real oss-demos.ts entry the hero's floating glass card types.
 *  Sourcing from the same data the Open-Source showcase uses guarantees the
 *  command shown is a real, shipped tool — never a fabricated example. */
export const HERO_FLOATING_DEMO_ID = "imsg-mcp"

/** Resolve the hero's demo script from the real oss-demos.ts data. Throws
 *  rather than silently falling back if the id drifts out of sync with
 *  data/oss-demos.ts. */
export function getHeroFloatingDemo(demos: OssDemo[] = ossDemos): Line[] {
  const demo = demos.find((d) => d.id === HERO_FLOATING_DEMO_ID)
  if (!demo) {
    throw new Error(`hero floating demo id "${HERO_FLOATING_DEMO_ID}" not found in oss-demos.ts`)
  }
  return demo.demo
}
