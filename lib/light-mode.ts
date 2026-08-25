/** Light mode is still being rebuilt (washed-out text, invisible chips), so it
 *  ships disabled: the toggle is hidden and the theme is forced dark.
 *  Set NEXT_PUBLIC_LIGHT_MODE=1 (see .env.local) to work on it locally. */
export const LIGHT_MODE_ENABLED = process.env.NEXT_PUBLIC_LIGHT_MODE === "1"
