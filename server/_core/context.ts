import type { CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { Request, Response } from "express";
import type { User } from "../types";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: {
    protocol?: string;
    headers: Record<string, string | string[] | undefined>;
    query?: Record<string, unknown>;
  };
  res: {
    cookie(name: string, value: string, options?: Record<string, unknown>): unknown;
    clearCookie(name: string, options?: Record<string, unknown>): unknown;
  };
  user: User | null;
};

export async function createExpressContext(
  opts: CreateExpressContextOptions,
): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateRequest(opts.req);
  } catch {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

type LambdaEvent = APIGatewayProxyEventV2 & Record<string, unknown>;

export async function createLambdaContext(
  opts: CreateAWSLambdaContextOptions<LambdaEvent>,
): Promise<TrpcContext> {
  const event = opts.event;
  const cookieHeader = [...(event.cookies ?? []), event.headers?.cookie ?? ""]
    .filter(Boolean)
    .join(";");
  const headers: Record<string, string | string[] | undefined> = {
    ...(event.headers ?? {}),
  };
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  const resLike: TrpcContext["res"] = {
    cookie() {},
    clearCookie() {},
  };
  let user: User | null = null;
  try {
    user = await authenticateRequest({ headers } as unknown as Pick<Request, "headers">);
  } catch {
    user = null;
  }
  return {
    req: {
      protocol: undefined,
      headers,
      query: event.queryStringParameters ?? {},
    },
    res: resLike,
    user,
  };
}