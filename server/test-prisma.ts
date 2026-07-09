import 'dotenv/config';
import { PrismaClient } from '@prisma/client/index.js';

console.log("Creating Prisma Client...");
try {
  const p = new PrismaClient();
  console.log("Success!");
} catch (e) {
  console.error("Error:", e);
}
