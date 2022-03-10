-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" INTEGER NOT NULL DEFAULT 2,
    "hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Office" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "in" INTEGER NOT NULL,
    "out" INTEGER NOT NULL DEFAULT 0,
    "isOut" BOOLEAN NOT NULL DEFAULT false,
    "employee" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    CONSTRAINT "Logs_employee_fkey" FOREIGN KEY ("employee") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "office" TEXT,
    "unit" TEXT,
    "position" TEXT,
    CONSTRAINT "Employee_office_fkey" FOREIGN KEY ("office") REFERENCES "Office" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_unit_fkey" FOREIGN KEY ("unit") REFERENCES "Unit" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Employee_position_fkey" FOREIGN KEY ("position") REFERENCES "Position" ("name") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_key" ON "User"("user");

-- CreateIndex
CREATE UNIQUE INDEX "Office_id_key" ON "Office"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Office_name_key" ON "Office"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_id_key" ON "Unit"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_id_key" ON "Position"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Logs_id_key" ON "Logs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_id_key" ON "Employee"("id");
