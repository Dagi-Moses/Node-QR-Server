import { PrismaClient, ProjectStatus, QRStatus, QRType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "../lib/prisma.js";

export async function seedDatabase() {
  const userId = "user_37USnCYzSgF2Rs1c0XeRx1Xalau";

  // reusable visitors to simulate returning users
  const visitors = Array.from({ length: 20 }).map(() => faker.string.uuid());

  for (let i = 0; i < 5; i++) {
    const project = await prisma.project.create({
      data: {
        userId,
        name: faker.lorem.words(3),
        description: faker.lorem.sentences(2),
        status: ProjectStatus.active,
      },
    });

    console.log(`Created project: ${project.name}`);

    for (let j = 0; j < 3; j++) {
      const qr = await prisma.qRCode.create({
        data: {
          name: faker.lorem.word(),
          projectId: project.id,
          type: QRType.url,
          payload: { url: faker.internet.url() },
          status: QRStatus.active,
        },
      });

      console.log(`  Created QR: ${qr.id}`);

      // 5–15 scans per QR for better analytics
      const scanCount = faker.number.int({ min: 5, max: 15 });

      for (let k = 0; k < scanCount; k++) {
        const country = faker.location.country();
        const device = faker.helpers.arrayElement([
          "mobile",
          "desktop",
          "tablet",
        ]);

        const os = faker.helpers.arrayElement([
          "iOS",
          "Android",
          "Windows",
          "macOS",
          "Linux",
        ]);

        const browser = faker.helpers.arrayElement([
          "Chrome",
          "Safari",
          "Firefox",
          "Edge",
        ]);

        await prisma.qRScan.create({
          data: {
            qrId: qr.id,
            projectId: project.id,

            visitorId: faker.helpers.arrayElement(visitors),
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),

            country,
            countryCode: faker.location.countryCode(),
            city: faker.location.city(),

            device,
            os,
            browser,
            referrer: faker.internet.url(),

            createdAt: faker.date.recent({ days: 30 }),
          },
        });
      }
    }
  }

  console.log("✅ Database seeding completed");
}
