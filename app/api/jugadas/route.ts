import { redirectTo } from "@/src/auth/http";
import { getSession } from "@/src/auth/session";
import { deactivateTicket, insertTicket } from "@/src/db";
import { loadBoard } from "@/src/data/draws";
import { formatSix, parseSix } from "@/src/domain/ticket";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return redirectTo(req, "/login", { next: "/jugadas" });
  const form = await req.formData();
  const action = String(form.get("action") ?? "create");

  if (action === "off") {
    const id = Number(form.get("id"));
    if (Number.isInteger(id)) deactivateTicket(session.uid, id);
    return redirectTo(req, "/jugadas");
  }

  const parsed = parseSix([0, 1, 2, 3, 4, 5].map((index) => String(form.get(`n${index}`) ?? "")));
  if ("error" in parsed) return redirectTo(req, "/jugadas", { error: parsed.error });
  const kind = form.get("kind") === "standing" ? "standing" : "once";
  const { upcoming } = loadBoard();
  insertTicket(session.uid, formatSix(parsed.numbers), kind, upcoming.sorteo);
  return redirectTo(req, "/jugadas");
}
