import { Hono } from "hono";
import { sentry, logger } from "@sentry/hono/bun";
import { HTTPException } from "hono/http-exception";
import dotenv from "dotenv";
import path from "path";

import sessions from "./routes/sessions";
import chat from "./routes/chat";

dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));
app.use(
  sentry(app, {
    dsn: process.env.SENTRY_DSN,
    enableLogs: true,
  }),
);

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    logger.warn("Handled HTTP error", {
      status: error.status,
      message: error.message,
      path: c.req.path,
      method: c.req.method,
    });
    return c.json(
      {
        error: error.message || "Request failed",
      },
      error.status,
    );
  }

  console.error("Unhandled server error", error);
  return c.json({ error: "Internal server error" }, 500);
});

const routes = app.route("/sessions", sessions).route("/chat", chat);
export type AppType = typeof routes;

// idleTimeout must be high, otherwise LLM tool calls might not complete
export default { port: 3000, fetch: app.fetch, idleTimeout: 255 };
