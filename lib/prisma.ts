import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

(async () => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log("✅ Database is реально connected");
  } catch (err) {
    console.error("❌ Database connection failed");
    console.error(err);
  }
})();

export default prisma;
