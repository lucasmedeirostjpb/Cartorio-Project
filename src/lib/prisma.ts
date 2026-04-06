import { PrismaClient } from "@prisma/client";
import path from "path";

// This makes the project extremely robust on Windows with folder spaces.
// We dynamically build the absolute path to the database.
const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = `file:${dbPath}`;

console.log("Prisma Initialization:");
console.log("  - CWD:", process.cwd());
console.log("  - DB Path:", dbPath);
console.log("  - DB URL:", dbUrl);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
