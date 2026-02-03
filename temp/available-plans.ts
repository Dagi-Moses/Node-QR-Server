import prisma from "../lib/prisma.js";

async function main() {
  await prisma.plan.upsert({
    where: { type: "week" },
    update: {
      amount: 100, // kobo
      currency: "NGN",
      interval: "week",
      isPopular: false,
      active: true,
    },
    create: {
      type: "week",
      amount: 100,
      currency: "NGN",
      interval: "week",
      isPopular: false,
      active: true,
    },
  });

  await prisma.plan.upsert({
    where: { type: "month" },
    update: {
      amount: 300,
      currency: "NGN",
      interval: "month",
      isPopular: true, // 👈 business decision
      active: true,
    },
    create: {
      type: "month",
      amount: 300,
      currency: "NGN",
      interval: "month",
      isPopular: true,
      active: true,
    },
  });

  await prisma.plan.upsert({
    where: { type: "year" },
    update: {
      amount: 1000,
      currency: "NGN",
      interval: "year",
      isPopular: false,
      active: true,
    },
    create: {
      type: "year",
      amount: 1000,
      currency: "NGN",
      interval: "year",
      isPopular: false,
      active: true,
    },
  });
}

main()
  .then(() => {
    console.log("✅ Plans seeded");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
