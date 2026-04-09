import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const taskAreas = [
    "Marketing",
    "Operations",
    "Schulung",
    "Kundenberatung",
    "Administration",
    "Onboarding",
    "Kurs-Entwicklung",
    "Prozessoptimierung",
    "Pause",
  ];

  for (const name of taskAreas) {
    await prisma.taskArea.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const client = await prisma.client.upsert({
    where: { name: "3Steps2" },
    update: {},
    create: { name: "3Steps2" },
  });

  const projects = [
    "Flutter",
    "KI",
    "Bildung First",
    "Doku",
    "Schulung",
    "Prozessoptimierung",
    "App programmieren",
  ];

  for (const name of projects) {
    await prisma.project.upsert({
      where: { name_clientId: { name, clientId: client.id } },
      update: {},
      create: { name, clientId: client.id },
    });
  }

  console.log("Seed erfolgreich: Aufgabenbereiche + Auftraggeber + Projekte angelegt.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
