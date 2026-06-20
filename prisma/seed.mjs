import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Стабильные id, чтобы повторный запуск сида не плодил дубликаты.
const people = [
  { id: "self", name: "Я", kind: "SELF", color: "#6366f1", order: 0 },
  { id: "child-david", name: "Давид", kind: "CHILD", color: "#2563eb", order: 1 },
  { id: "child-artem", name: "Артём", kind: "CHILD", color: "#16a34a", order: 2 },
  { id: "child-kirill", name: "Кирилл", kind: "CHILD", color: "#ea580c", order: 3 },
  { id: "family", name: "Семья", kind: "FAMILY", color: "#64748b", order: 4 },
];

const lists = [
  { id: "list-home", kind: "HOME", name: "Дом", order: 0 },
  { id: "list-self", kind: "SELF", name: "Себе", order: 1 },
  { id: "list-kids", kind: "KIDS", name: "Детям", order: 2 },
];

async function main() {
  for (const p of people) {
    await prisma.person.upsert({
      where: { id: p.id },
      update: { name: p.name, kind: p.kind, color: p.color, order: p.order },
      create: p,
    });
  }

  for (const l of lists) {
    await prisma.shoppingList.upsert({
      where: { id: l.id },
      update: { kind: l.kind, name: l.name, order: l.order },
      create: l,
    });
  }

  console.log(`Сид готов: ${people.length} человек, ${lists.length} списка покупок.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
