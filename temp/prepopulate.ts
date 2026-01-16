import { PrismaClient, ProjectStatus, QRStatus, QRType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "../lib/prisma.js";

export async function seedDatabase() {
  // Create 5 sample projects
  for (let i = 0; i < 5; i++) {
    const project = await prisma.project.create({
      data: {
        userId: "user_37USnCYzSgF2Rs1c0XeRx1Xalau", // random user ID
        name: faker.lorem.words(3),
        description: faker.lorem.sentences(2),
        status: ProjectStatus.active,
      },
    });

    console.log(`Created project: ${project.name}`);

    // Create 3 QR codes per project
    for (let j = 0; j < 3; j++) {
      const qr = await prisma.qRCode.create({
        data: {
          name: faker.lorem.word(),
          projectId: project.id,
          type: QRType.url, // or dynamic, adjust as needed
          payload: { text: faker.lorem.sentence() }, // JSON payload
          status: QRStatus.active,
        },
      });

      console.log(`  Created QR: ${qr.id}`);

      // Create 2 scans per QR code
      for (let k = 0; k < 2; k++) {
        await prisma.qRScan.create({
          data: {
            qrId: qr.id,
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
          },
        });

        console.log(` Created scan #${k + 1}`);
      }
    }
  }
}
