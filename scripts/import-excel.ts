import fs from "fs";
import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";
import { parseExcelBuffer } from "../lib/excelImport";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(__dirname, "..", "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_FILE = path.resolve(
  __dirname,
  "../../Mes_Candidatures1 (version 1).xlsx"
);

async function main() {
  const write = process.argv.includes("--write");
  const filePath = process.argv[2]?.startsWith("--")
    ? DEFAULT_FILE
    : process.argv[2] ?? DEFAULT_FILE;

  const buffer = fs.readFileSync(filePath);
  const { applications, headers, fieldMapping } = parseExcelBuffer(buffer);

  console.log("Detected columns:", headers);
  console.log("Field mapping:", fieldMapping);

  if (applications.length === 0) {
    console.log("No rows found in", filePath);
    return;
  }

  for (const app of applications) {
    if (write) {
      await prisma.application.create({ data: app });
    } else {
      console.log("[dry-run]", app.company, "-", app.jobTitle);
    }
  }

  console.log(
    `${write ? "Imported" : "Would import"} ${applications.length} rows.`
  );
  if (!write) {
    console.log("Re-run with --write to actually insert into the database.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
