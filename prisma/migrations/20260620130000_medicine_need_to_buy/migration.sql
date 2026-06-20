-- Переименование lowStock → needToBuy и удаление столбца location.
ALTER TABLE "Medicine" RENAME COLUMN "lowStock" TO "needToBuy";
ALTER TABLE "Medicine" DROP COLUMN "location";
