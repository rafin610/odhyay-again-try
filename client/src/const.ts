import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Navigate to the sign-in page. Kept as the shared entry point so any existing
// caller (or a future in-page login trigger) works unchanged.
export const startLogin = () => {
  window.location.assign("/login");
};