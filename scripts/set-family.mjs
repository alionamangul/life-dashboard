// Обновление состава семьи (идемпотентно). Запуск: node scripts/set-family.mjs
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const d = (s) => new Date(`${s}T12:00:00Z`);

async function upsertPerson({ name, kind, birthDate, color, order }) {
  const existing =
    kind === "SELF"
      ? await prisma.person.findFirst({ where: { kind: "SELF" } })
      : await prisma.person.findFirst({ where: { name } });
  if (existing) {
    await prisma.person.update({
      where: { id: existing.id },
      data: { name, kind, birthDate, ...(color ? { color } : {}) },
    });
    return "updated";
  }
  await prisma.person.create({
    data: { name, kind, birthDate, color: color ?? "#64748b", order: order ?? 0 },
  });
  return "created";
}

async function main() {
  const roster = [
    { name: "Алёна", kind: "SELF", birthDate: d("1988-05-20"), color: "#6366f1", order: 0 },
    { name: "Армен", kind: "FAMILY", birthDate: d("1981-08-26"), color: "#9333ea", order: 1 },
    { name: "Давид", kind: "CHILD", birthDate: d("2019-01-30"), color: "#2563eb", order: 2 },
    { name: "Артём", kind: "CHILD", birthDate: d("2020-04-29"), color: "#16a34a", order: 3 },
    { name: "Кирилл", kind: "CHILD", birthDate: d("2024-06-25"), color: "#ea580c", order: 4 },
  ];
  for (const p of roster) {
    const res = await upsertPerson(p);
    console.log(`${res}: ${p.name} (${p.kind}) ${p.birthDate.toISOString().slice(0, 10)}`);
  }
  const all = await prisma.person.findMany({ orderBy: { order: "asc" } });
  console.log(
    "\nИтого людей:",
    all.map((x) => `${x.name}/${x.kind}`).join(", ")
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
