import type { Metadata } from "next";
import { MedicineImport } from "./import-form";

export const metadata: Metadata = { title: "Импорт аптечки" };

export default function MedicineImportPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-xl font-bold text-slate-900">Импорт списка</h1>
      <MedicineImport />
    </div>
  );
}
