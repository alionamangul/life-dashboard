// Единый список разделов — источник правды для дашборда и меню навигации.

export type Section = {
  key: string;
  href: string;
  title: string;
  emoji: string;
  description: string;
  /** Полные литералы tailwind-классов (важно для сканера Tailwind v4). */
  iconClass: string;
};

export const SECTIONS: Section[] = [
  {
    key: "documents",
    href: "/documents",
    title: "Документы",
    emoji: "📄",
    description: "Сканы паспортов, страховок, медкарт",
    iconClass: "bg-blue-100 text-blue-700",
  },
  {
    key: "checklists",
    href: "/checklists",
    title: "Чек-листы",
    emoji: "✅",
    description: "Тренировки и уход за собой",
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "schedule",
    href: "/schedule",
    title: "Расписание",
    emoji: "🗓️",
    description: "Тренировки — мои и детей",
    iconClass: "bg-violet-100 text-violet-700",
  },
  {
    key: "children",
    href: "/children",
    title: "Дети",
    emoji: "🧒",
    description: "Профили, рост и вес, события",
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    key: "places",
    href: "/places",
    title: "Места",
    emoji: "📍",
    description: "Куда хочу съездить",
    iconClass: "bg-rose-100 text-rose-700",
  },
  {
    key: "shopping",
    href: "/shopping",
    title: "Покупки",
    emoji: "🛒",
    description: "Списки: дом, себе, детям",
    iconClass: "bg-teal-100 text-teal-700",
  },
  {
    key: "medicine",
    href: "/medicine",
    title: "Аптечка",
    emoji: "💊",
    description: "Лекарства, сроки, где лежит",
    iconClass: "bg-red-100 text-red-700",
  },
];
