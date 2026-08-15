import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "../server/routers";
import { createLambdaContext } from "../server/_core/context";

// Vercel serverless function for /api/trpc. The trpc AWS Lambda adapter maps
// Vercel's Node function request onto tRPC, and createLambdaContext resolves
// the Supabase session from the Authorization header / session cookie.
export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: createLambdaContext,
});

export default handler;