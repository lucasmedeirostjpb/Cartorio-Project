import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  console.log("Current working directory:", process.cwd());
  console.log("DATABASE_URL from env:", process.env.DATABASE_URL);
  
  try {
    console.log("Trying to connect to Prisma...");
    const count = await prisma.processo.count();
    console.log("SUCCESS! Processo count:", count);
  } catch (err) {
    console.error("FAILURE! Error details:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
