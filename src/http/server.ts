import http from "http";
import https from "https";
import express from "express";
import cors from "cors";
import { buildRouter } from "./router";

type Opts = {
  tlsKey?: any;
  tlsCert?: any;
  httpsPort?: number;
  enableHttps?: boolean;
  enableHttpLoopback?: boolean;
  httpPort?: number;
  apiKey: string;
};

export function startServers(opts: Opts, handlers: any) {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  app.use(cors({
    origin: [/^https?:\/\/(localhost|127\.0\.0\.1|host\.docker\.internal)(:\d+)?$/],
    credentials: false
  }));

  // Simple auth
  app.use((req, res, next) => {
    const hdr = req.header("authorization") || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
    if (req.method === "GET" && (req.path === "/" || req.path === "/status")) return next();
    if (token && token === opts.apiKey) return next();
    return res.status(401).json({ message: "Authorization required.", errorCode: 40101 });
  });

  // Root
  app.get("/", (_req, res) => {
    res.json({ status: "OK", service: "M42 Obsidian API", authenticated: true });
  });

  // Routes
  app.use("/", buildRouter(handlers));

  const servers: any = {};
  if (opts.enableHttps !== false && opts.tlsKey && opts.tlsCert) {
    servers.https = https.createServer({ key: opts.tlsKey, cert: opts.tlsCert }, app)
      .listen(opts.httpsPort ?? 27124, "127.0.0.1");
  }
  if (opts.enableHttpLoopback) {
    servers.http = http.createServer(app).listen(opts.httpPort ?? 27125, "127.0.0.1");
  }
  return servers;
}
