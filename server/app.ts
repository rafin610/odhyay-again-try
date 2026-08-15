import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";
import { createExpressContext } from "./_core/context.js";

/**
 * The full HTTP app, kept free of `server.listen()` so the same request
 * pipeline can run locally or be mounted on a Vercel serverless function.
 */
export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: createExpressContext,
    }),
  );

  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  return app;
}