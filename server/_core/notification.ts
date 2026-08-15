import { TRPCError } from "@trpc/server";
import { ENV } from "./env.js";

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20_000;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: { title: string; content: string }) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }
  return { title, content };
};

/**
 * Deliver a notification to the owner. If a SUPABASE_OWNER_WEBHOOK_URL is
 * configured it is POSTed there (fire-and-forget); otherwise the notification
 * is only logged and reported as undelivered.
 */
export async function notifyOwner(payload: {
  title: string;
  content: string;
}): Promise<boolean> {
  const { title, content } = validatePayload(payload);
  const webhookUrl = process.env.SUPABASE_OWNER_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[Notification] No SUPABASE_OWNER_WEBHOOK_URL configured; skipping delivery.");
    return false;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[Notification] Webhook failed (${response.status})${detail ? `: ${detail}` : ""}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling owner webhook:", error);
    return false;
  }
}