import { describe, expect, it } from "vitest";
import { parseCookies, extractSessionToken } from "./_core/auth";
import { COOKIE_NAME } from "../shared/const";

describe("session token extraction", () => {
  it("parses the session cookie from a raw Cookie header", () => {
    const cookies = parseCookies(`theme=dark; ${COOKIE_NAME}=abc123; other=x`);
    expect(cookies.get(COOKIE_NAME)).toBe("abc123");
  });

  it("extracts the token from the cookie first", () => {
    const token = extractSessionToken({
      headers: {
        cookie: `${COOKIE_NAME}=cookie-token`,
        authorization: "Bearer header-token",
      },
    });
    expect(token).toBe("cookie-token");
  });

  it("falls back to the Authorization Bearer header", () => {
    const token = extractSessionToken({
      headers: {
        authorization: "Bearer header-token",
      },
    });
    expect(token).toBe("header-token");
  });

  it("returns null when no session is present", () => {
    const token = extractSessionToken({ headers: {} });
    expect(token).toBeNull();
  });
});