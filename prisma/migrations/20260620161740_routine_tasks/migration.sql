-- CreateTable
CREATE TABLE "RoutineTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "days" TEXT NOT NULL DEFAULT '1234567',
    "personId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RoutineCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    CONSTRAINT "RoutineCheck_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RoutineTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "RoutineTask_category_idx" ON "RoutineTask"("category");

-- CreateIndex
CREATE INDEX "RoutineCheck_date_idx" ON "RoutineCheck"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineCheck_taskId_date_key" ON "RoutineCheck"("taskId", "date");
