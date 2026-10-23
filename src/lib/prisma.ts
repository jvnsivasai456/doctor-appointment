import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Netlify / AWS Lambda Serverless support:
// Serverless filesystem root is read-only, while /tmp is writable.
if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const currentDbUrl = process.env.DATABASE_URL || "";
  // If using local SQLite database
  if (!currentDbUrl || currentDbUrl.startsWith("file:")) {
    const tmpDbPath = "/tmp/dev.db";
    const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
        console.log("Copied SQLite database to /tmp/dev.db for Netlify Serverless execution");
      }
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    } catch (err) {
      console.warn("Notice: SQLite /tmp setup on serverless:", err);
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

