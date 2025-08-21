// src/main.ts
import { Plugin } from "obsidian";
import { startServers } from "./http/server";

export default class M42ApiPlugin extends Plugin {
  servers: any;

  async onload() {
    console.log("M42 API: loading plugin");
    try {
      // TEMP: hardcode a key to prove it works. Change later.
      const apiKey = "dev-key";
      this.servers = startServers(
        {
          apiKey,
          enableHttps: false,
          enableHttpLoopback: true,
          httpPort: 27125
        },
        {
          status: (_req: any, res: any) => res.json({ ok: true }),
          listNotes: async (_req: any, res: any) => res.json([]),
          search: async (req: any, res: any) => res.json({ q: req.query.q ?? "", results: [] })
        }
      );
      console.log("M42 API: HTTP loopback on 127.0.0.1:27125");
    } catch (err) {
      console.error("M42 API: failed to start server", err);
    }
  }

  onunload() {
    console.log("M42 API: unloading plugin");
    if (this.servers?.http) this.servers.http.close();
    if (this.servers?.https) this.servers.https.close();
  }
}

