import { Router } from "express";

export function buildRouter(handlers: any) {
  const r = Router();

  // Health
  r.get("/status", handlers.status);

  // Notes
  r.get("/notes", handlers.listNotes);            // legacy
  r.get("/v1/notes", handlers.listNotes);         // versioned alias

  // Search
  r.get("/search", handlers.search);
  r.get("/v1/search", handlers.search);

  return r;
}
