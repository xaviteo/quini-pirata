import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPassword } from "@/src/auth/password";

export type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  phone: string | null;
  role: "admin" | "member";
};

export type TicketRow = {
  id: number;
  user_id: number;
  numbers: string;
  kind: "once" | "standing";
  starts_sorteo: number;
  active: number;
};

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  used_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  numbers TEXT NOT NULL,
  kind TEXT NOT NULL,
  starts_sorteo INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

let database: DatabaseSync | null = null;
let seeded: Promise<void> | null = null;

export function getDb(): DatabaseSync {
  if (!database) {
    const dir = path.join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    database = new DatabaseSync(path.join(dir, "quini.db"));
    database.exec("PRAGMA foreign_keys = ON");
    database.exec(SCHEMA);
  }
  return database;
}

export function ensureAdmin(): Promise<void> {
  if (!seeded) {
    seeded = seedAdmin();
  }
  return seeded;
}

async function seedAdmin(): Promise<void> {
  const db = getDb();
  const row = db.prepare("SELECT id FROM users LIMIT 1").get();
  if (row) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const passwordHash = await hashPassword(password);
  db.prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')").run(
    email,
    "Admin",
    passwordHash,
  );
}

export function findUserByEmail(email: string): UserRow | undefined {
  return getDb().prepare("SELECT id, email, name, password_hash, phone, role FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;
}

export function findUserById(id: number): UserRow | undefined {
  return getDb().prepare("SELECT id, email, name, password_hash, phone, role FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}

export function listTickets(userId: number): TicketRow[] {
  return getDb()
    .prepare(
      "SELECT id, user_id, numbers, kind, starts_sorteo, active FROM tickets WHERE user_id = ? ORDER BY id DESC",
    )
    .all(userId) as TicketRow[];
}

export function insertTicket(userId: number, numbers: string, kind: "once" | "standing", startsSorteo: number): void {
  getDb()
    .prepare("INSERT INTO tickets (user_id, numbers, kind, starts_sorteo) VALUES (?, ?, ?, ?)")
    .run(userId, numbers, kind, startsSorteo);
}

export function deactivateTicket(userId: number, ticketId: number): void {
  getDb().prepare("UPDATE tickets SET active = 0 WHERE id = ? AND user_id = ?").run(ticketId, userId);
}

export function createInvite(createdBy: number, email: string | null): string {
  const token = randomToken();
  getDb().prepare("INSERT INTO invites (token, email, created_by) VALUES (?, ?, ?)").run(token, email, createdBy);
  return token;
}

export function findInvite(token: string): { token: string; email: string | null; used_by: number | null } | undefined {
  return getDb()
    .prepare("SELECT token, email, used_by FROM invites WHERE token = ?")
    .get(token) as { token: string; email: string | null; used_by: number | null } | undefined;
}

export async function acceptInvite(input: {
  token: string;
  name: string;
  email: string;
  password: string;
  phone: string | null;
}): Promise<string | null> {
  const invite = findInvite(input.token);
  if (!invite || invite.used_by) return "Esa invitación ya no sirve.";
  const email = input.email.trim().toLowerCase();
  if (invite.email && invite.email !== email) return "El mail no coincide con la invitación.";
  if (findUserByEmail(email)) return "Ese mail ya tiene cuenta.";
  const passwordHash = await hashPassword(input.password);
  const db = getDb();
  const inserted = db
    .prepare("INSERT INTO users (email, name, password_hash, phone, role) VALUES (?, ?, ?, ?, 'member')")
    .run(email, input.name.trim(), passwordHash, input.phone);
  const userId = Number(inserted.lastInsertRowid);
  db.prepare("UPDATE invites SET used_by = ? WHERE token = ?").run(userId, input.token);
  return null;
}

function randomToken(): string {
  return randomBytes(18).toString("base64url");
}
