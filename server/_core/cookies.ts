export function isSecureRequest(req: {
  protocol?: string;
  headers: Record<string, string | string[] | undefined>;
}): boolean {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: {
  protocol?: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none" as const,
    secure: isSecureRequest(req),
  };
}